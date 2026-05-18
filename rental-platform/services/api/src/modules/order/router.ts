import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../common/auth.js";
import { fail, ok } from "../../common/response.js";
import { drivers, orders, users, vehicles } from "../../common/store.js";
import { paginate, parsePageQuery } from "../../common/pagination.js";
import type { Order, OrderListItem, OrderStatus } from "../../common/types.js";

const createOrderSchema = z.object({
  vehicleTypeId: z.string().min(1),
  pickupStoreId: z.string().min(1),
  returnStoreId: z.string().min(1),
  pickupTime: z.string().datetime(),
  returnTime: z.string().datetime(),
  city: z.string().optional(),
  settlementMode: z.enum(["PREPAID", "POSTPAID"]).default("PREPAID"),
  serviceMode: z.enum(["SELF_DRIVE", "WITH_DRIVER"]).default("SELF_DRIVE"),
  billingAccountId: z.string().optional(),
  accountType: z.enum(["C", "B", "G"]).optional(),
  driverId: z.string().optional()
});

function releaseDriver(driverId?: string) {
  if (!driverId) return;
  const driver = drivers.get(driverId);
  if (driver && driver.status === "ON_DUTY") {
    driver.status = "AVAILABLE";
    drivers.set(driver.id, driver);
  }
}

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowedMap: Record<OrderStatus, OrderStatus[]> = {
    PENDING_PAYMENT: ["PAYMENT_FAILED", "CONFIRMED", "CANCELED"],
    PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELED"],
    CONFIRMED: ["READY_FOR_PICKUP", "CANCELED"],
    READY_FOR_PICKUP: ["IN_USE"],
    IN_USE: ["RETURN_PENDING_SETTLEMENT"],
    RETURN_PENDING_SETTLEMENT: ["SETTLED"],
    SETTLED: ["COMPLETED"],
    COMPLETED: [],
    CANCELED: []
  };

  return allowedMap[from].includes(to);
}

function toOrderListItem(order: Order): OrderListItem {
  const vehicle = vehicles.get(order.vehicleId);
  return {
    ...order,
    plateNumber: vehicle?.plateNumber ?? "-",
    vehicleTypeId: vehicle?.vehicleTypeId ?? "-",
    city: vehicle?.city ?? "-"
  };
}

export const orderRouter = Router();

orderRouter.get("/", requireAuth, (req, res) => {
  const auth = (req as typeof req & { auth: { userId: string } }).auth;
  const scope = String(req.query.scope || "mine").trim();
  const status = String(req.query.status || "").trim();
  const orderNo = String(req.query.orderNo || "").trim().toLowerCase();
  const userId = String(req.query.userId || "").trim();
  const { page, pageSize } = parsePageQuery(req.query as Record<string, unknown>);

  let list = [...orders.values()];

  if (scope !== "all") {
    list = list.filter((order) => order.userId === auth.userId);
  } else if (userId.length > 0) {
    list = list.filter((order) => order.userId === userId);
  }

  if (status.length > 0) {
    list = list.filter((order) => order.status === status);
  }

  if (orderNo.length > 0) {
    list = list.filter((order) => order.orderNo.toLowerCase().includes(orderNo));
  }

  list.sort((a, b) => b.pickupTime.localeCompare(a.pickupTime));

  const items = list.map(toOrderListItem);
  ok(req, res, paginate(items, page, pageSize));
});

orderRouter.post("/", requireAuth, (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const auth = (req as typeof req & { auth: { userId: string } }).auth;
  const user = users.get(auth.userId);
  if (!user || !user.licenseValid) {
    fail(req, res, "User is not eligible to rent", 403);
    return;
  }

  const pickedVehicle = [...vehicles.values()].find(
    (vehicle) =>
      vehicle.status === "AVAILABLE" &&
      vehicle.vehicleTypeId === parsed.data.vehicleTypeId &&
      (!parsed.data.city || parsed.data.city.toLowerCase() === vehicle.city.toLowerCase())
  );

  if (!pickedVehicle) {
    fail(req, res, "No available vehicles", 409);
    return;
  }

  if (parsed.data.settlementMode === "POSTPAID" && !parsed.data.billingAccountId) {
    fail(req, res, "billingAccountId is required for POSTPAID", 422);
    return;
  }

  if (parsed.data.serviceMode === "WITH_DRIVER" && !parsed.data.driverId) {
    fail(req, res, "driverId is required for WITH_DRIVER", 422);
    return;
  }

  if (parsed.data.serviceMode === "WITH_DRIVER" && parsed.data.driverId) {
    const driver = drivers.get(parsed.data.driverId);
    if (!driver) {
      fail(req, res, "Driver not found", 404);
      return;
    }
    if (driver.status !== "AVAILABLE" && driver.status !== "ON_DUTY") {
      fail(req, res, "Driver is not available", 409);
      return;
    }
    if (parsed.data.city && driver.city.toLowerCase() !== parsed.data.city.toLowerCase()) {
      fail(req, res, "Driver city does not match order city", 422);
      return;
    }
    driver.status = "ON_DUTY";
    drivers.set(driver.id, driver);
  }

  if (parsed.data.accountType && parsed.data.accountType === "C" && parsed.data.settlementMode === "POSTPAID") {
    fail(req, res, "C account cannot create POSTPAID order", 422);
    return;
  }

  pickedVehicle.status = "IN_USE";
  vehicles.set(pickedVehicle.id, pickedVehicle);

  const chauffeurFee = parsed.data.serviceMode === "WITH_DRIVER" ? 120 : 0;
  const estimatedFee = pickedVehicle.dailyPrice + chauffeurFee;
  const billingPeriod = parsed.data.pickupTime.slice(0, 7);
  const newOrder: Order = {
    id: randomUUID(),
    orderNo: `R${Date.now()}`,
    userId: auth.userId,
    vehicleId: pickedVehicle.id,
    pickupStoreId: parsed.data.pickupStoreId,
    returnStoreId: parsed.data.returnStoreId,
    pickupTime: parsed.data.pickupTime,
    returnTime: parsed.data.returnTime,
    status: parsed.data.settlementMode === "POSTPAID" ? "CONFIRMED" : "PENDING_PAYMENT",
    settlementMode: parsed.data.settlementMode,
    serviceMode: parsed.data.serviceMode,
    billingAccountId: parsed.data.billingAccountId,
    billingPeriod: parsed.data.settlementMode === "POSTPAID" ? billingPeriod : undefined,
    accountType: parsed.data.accountType,
    driverId: parsed.data.driverId,
    chauffeurFee,
    estimatedFee,
    totalFee: estimatedFee,
    paidAmount: 0
  };

  orders.set(newOrder.id, newOrder);
  ok(req, res, newOrder, "created", 201);
});

orderRouter.get("/:orderId", requireAuth, (req, res) => {
  const orderId = String(req.params.orderId);
  const order = orders.get(orderId);
  if (!order) {
    fail(req, res, "Order not found", 404);
    return;
  }
  ok(req, res, order);
});

orderRouter.put("/:orderId/cancel", requireAuth, (req, res) => {
  const orderId = String(req.params.orderId);
  const order = orders.get(orderId);
  if (!order) {
    fail(req, res, "Order not found", 404);
    return;
  }
  if (!canTransition(order.status, "CANCELED")) {
    fail(req, res, "Illegal status transition", 409);
    return;
  }

  order.status = "CANCELED";
  const vehicle = vehicles.get(order.vehicleId);
  if (vehicle) {
    vehicle.status = "AVAILABLE";
    vehicles.set(vehicle.id, vehicle);
  }
  releaseDriver(order.driverId);
  orders.set(order.id, order);

  ok(req, res, order);
});

orderRouter.put("/:orderId/pickup", requireAuth, (req, res) => {
  const orderId = String(req.params.orderId);
  const order = orders.get(orderId);
  if (!order) {
    fail(req, res, "Order not found", 404);
    return;
  }

  const nextStatus: OrderStatus = order.status === "CONFIRMED" ? "READY_FOR_PICKUP" : "IN_USE";
  if (!canTransition(order.status, nextStatus)) {
    fail(req, res, "Illegal status transition", 409);
    return;
  }
  order.status = nextStatus;

  if (order.status === "READY_FOR_PICKUP") {
    order.status = "IN_USE";
  }

  orders.set(order.id, order);
  ok(req, res, order);
});

orderRouter.put("/:orderId/return", requireAuth, (req, res) => {
  const orderId = String(req.params.orderId);
  const order = orders.get(orderId);
  if (!order) {
    fail(req, res, "Order not found", 404);
    return;
  }
  if (!canTransition(order.status, "RETURN_PENDING_SETTLEMENT")) {
    fail(req, res, "Illegal status transition", 409);
    return;
  }

  order.status = "RETURN_PENDING_SETTLEMENT";
  if (!canTransition(order.status, "SETTLED")) {
    fail(req, res, "Settlement transition failed", 409);
    return;
  }
  order.status = "SETTLED";
  order.totalFee = order.estimatedFee;
  if (canTransition(order.status, "COMPLETED")) {
    order.status = "COMPLETED";
  }

  const vehicle = vehicles.get(order.vehicleId);
  if (vehicle) {
    vehicle.status = "AVAILABLE";
    vehicles.set(vehicle.id, vehicle);
  }
  releaseDriver(order.driverId);
  orders.set(order.id, order);

  ok(req, res, order);
});
