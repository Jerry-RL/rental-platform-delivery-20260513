import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../common/auth.js";
import { paginate, parsePageQuery } from "../../common/pagination.js";
import { fail, ok } from "../../common/response.js";
import { orders, vehicles } from "../../common/store.js";
import type { VehicleStatus } from "../../common/types.js";
import { enrichVehicle, normalizeVehicle } from "../../common/vehicle-utils.js";

const vehicleBodySchema = z.object({
  plateNumber: z.string().min(5),
  vehicleTypeId: z.string().min(1),
  city: z.string().min(2),
  dailyPrice: z.number().positive(),
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE"]).default("AVAILABLE"),
  brand: z.string().optional(),
  model: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.number().nonnegative().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  insuranceExpiryDate: z.string().optional(),
  annualReviewExpiryDate: z.string().optional(),
  remindBeforeDays: z.number().int().min(1).max(180).default(30)
});

const updateStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "IN_USE", "MAINTENANCE"])
});

function hasActiveOrder(vehicleId: string) {
  return [...orders.values()].some(
    (order) =>
      order.vehicleId === vehicleId &&
      !["COMPLETED", "CANCELED"].includes(order.status)
  );
}

export const vehicleRouter = Router();

vehicleRouter.get("/", (req, res) => {
  const city = String(req.query.city || "").trim();
  const vehicleTypeId = String(req.query.vehicleTypeId || "").trim();
  const status = String(req.query.status || "").trim() as VehicleStatus | "";
  const scope = String(req.query.scope || "rental").trim();
  const reminder = String(req.query.reminder || "").trim();
  const { page, pageSize } = parsePageQuery(req.query as Record<string, unknown>);
  const keyword = String(req.query.keyword || "").trim().toLowerCase();

  let list = [...vehicles.values()].map((v) => enrichVehicle(v));

  if (scope === "rental") {
    list = list.filter((v) => v.status === "AVAILABLE");
  }

  if (city.length > 0) {
    list = list.filter((v) => v.city.toLowerCase() === city.toLowerCase());
  }

  if (vehicleTypeId.length > 0) {
    list = list.filter((v) => v.vehicleTypeId === vehicleTypeId);
  }

  if (status.length > 0) {
    list = list.filter((v) => v.status === status);
  }

  if (keyword.length > 0) {
    list = list.filter(
      (v) =>
        v.plateNumber.toLowerCase().includes(keyword) ||
        v.vehicleTypeId.toLowerCase().includes(keyword) ||
        v.city.toLowerCase().includes(keyword) ||
        v.brand.toLowerCase().includes(keyword) ||
        v.model.toLowerCase().includes(keyword)
    );
  }

  if (reminder === "expiring") {
    list = list.filter(
      (v) =>
        v.insuranceReminder === "EXPIRING_SOON" ||
        v.insuranceReminder === "EXPIRED" ||
        v.annualReviewReminder === "EXPIRING_SOON" ||
        v.annualReviewReminder === "EXPIRED"
    );
  }

  list.sort((a, b) => a.plateNumber.localeCompare(b.plateNumber, "zh-CN"));
  ok(req, res, paginate(list, page, pageSize));
});

vehicleRouter.get("/:vehicleId", requireAuth, (req, res) => {
  const vehicle = vehicles.get(String(req.params.vehicleId));
  if (!vehicle) {
    fail(req, res, "Vehicle not found", 404);
    return;
  }
  ok(req, res, enrichVehicle(vehicle));
});

vehicleRouter.post("/", requireAuth, (req, res) => {
  const parsed = vehicleBodySchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const duplicate = [...vehicles.values()].find((v) => v.plateNumber === parsed.data.plateNumber);
  if (duplicate) {
    fail(req, res, "Plate number already exists", 409);
    return;
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  const imageUrl = parsed.data.imageUrl || "";
  const vehicle = normalizeVehicle({
    id,
    plateNumber: parsed.data.plateNumber,
    vehicleTypeId: parsed.data.vehicleTypeId,
    city: parsed.data.city,
    dailyPrice: parsed.data.dailyPrice,
    status: parsed.data.status,
    brand: parsed.data.brand ?? "",
    model: parsed.data.model ?? "",
    vin: parsed.data.vin ?? "",
    mileage: parsed.data.mileage ?? 0,
    imageUrl,
    images: parsed.data.images ?? (imageUrl ? [imageUrl] : []),
    insuranceExpiryDate: parsed.data.insuranceExpiryDate ?? "",
    annualReviewExpiryDate: parsed.data.annualReviewExpiryDate ?? "",
    remindBeforeDays: parsed.data.remindBeforeDays,
    createdAt: now,
    updatedAt: now
  });

  vehicles.set(id, vehicle);
  ok(req, res, enrichVehicle(vehicle), "created", 201);
});

vehicleRouter.put("/:vehicleId/status", requireAuth, (req, res) => {
  const vehicleId = String(req.params.vehicleId);
  const vehicle = vehicles.get(vehicleId);
  if (!vehicle) {
    fail(req, res, "Vehicle not found", 404);
    return;
  }

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  vehicle.status = parsed.data.status;
  vehicle.updatedAt = new Date().toISOString();
  vehicles.set(vehicle.id, normalizeVehicle(vehicle));
  ok(req, res, enrichVehicle(vehicle));
});

vehicleRouter.put("/:vehicleId", requireAuth, (req, res) => {
  const vehicleId = String(req.params.vehicleId);
  const existing = vehicles.get(vehicleId);
  if (!existing) {
    fail(req, res, "Vehicle not found", 404);
    return;
  }

  const parsed = vehicleBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  if (parsed.data.plateNumber && parsed.data.plateNumber !== existing.plateNumber) {
    const duplicate = [...vehicles.values()].find((v) => v.plateNumber === parsed.data.plateNumber && v.id !== vehicleId);
    if (duplicate) {
      fail(req, res, "Plate number already exists", 409);
      return;
    }
  }

  const merged = normalizeVehicle({
    ...existing,
    ...parsed.data,
    id: vehicleId,
    updatedAt: new Date().toISOString()
  });

  if (parsed.data.imageUrl !== undefined) {
    merged.imageUrl = parsed.data.imageUrl || merged.imageUrl;
    if (parsed.data.images) {
      merged.images = parsed.data.images;
    } else if (parsed.data.imageUrl) {
      merged.images = [parsed.data.imageUrl];
    }
  }

  vehicles.set(vehicleId, merged);
  ok(req, res, enrichVehicle(merged));
});

vehicleRouter.delete("/:vehicleId", requireAuth, (req, res) => {
  const vehicleId = String(req.params.vehicleId);
  const existing = vehicles.get(vehicleId);
  if (!existing) {
    fail(req, res, "Vehicle not found", 404);
    return;
  }

  if (existing.status === "IN_USE" || hasActiveOrder(vehicleId)) {
    fail(req, res, "Vehicle has active orders and cannot be deleted", 409);
    return;
  }

  vehicles.delete(vehicleId);
  ok(req, res, { id: vehicleId, deleted: true });
});
