import { buildDriverDetail, type DriverDetailView } from "./driver-detail";
import { orderStatusLabel, serviceModeLabel, violationHandleStatusLabel, violationPaymentStatusLabel } from "./labels";
import type { PreviewStore } from "./store";
import type { Driver, Order, OrderStatus, ServiceMode, ViolationRecord } from "./types";
import { normalizeViolation } from "./violation-batch";

export type DriverOrderHistoryItem = {
  id: string;
  orderNo: string;
  plateNumber: string;
  serviceMode: ServiceMode;
  status: OrderStatus;
  statusLabel: string;
  serviceModeLabel: string;
  pickupTime: string;
  returnTime: string;
  chauffeurFee: number;
  totalFee: number;
};

export type DriverViolationAttribution = "EXPLICIT" | "RENTAL_PERIOD";

export type DriverViolationItem = ViolationRecord & {
  attribution: DriverViolationAttribution;
  relatedOrderId?: string;
  relatedOrderNo?: string;
  paymentLabel: string;
  handleLabel: string;
};

export type DriverAdminStats = {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalChauffeurFee: number;
  violationTotal: number;
  violationUnpaid: number;
  violationUnprocessed: number;
  violationPoints: number;
};

export type DriverAdminProfile = {
  driver: Driver;
  detail: DriverDetailView;
  stats: DriverAdminStats;
  orders: DriverOrderHistoryItem[];
  violations: DriverViolationItem[];
};

const ACTIVE_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_USE",
  "RETURN_PENDING_SETTLEMENT"
];

const COMPLETED_STATUSES: OrderStatus[] = ["COMPLETED", "SETTLED"];

const inRentalPeriod = (order: Order, violationTime: string) =>
  violationTime >= order.pickupTime && violationTime <= order.returnTime;

const findRentalOrder = (orders: Order[], violation: ViolationRecord): Order | undefined =>
  orders.find(
    (o) => o.vehicleId === violation.vehicleId && inRentalPeriod(o, violation.violationTime)
  );

export const resolveDriverViolations = (
  store: PreviewStore,
  driverId: string
): DriverViolationItem[] => {
  const driverOrders = store.orders.filter((o) => o.driverId === driverId);
  const seen = new Set<string>();
  const items: DriverViolationItem[] = [];

  for (const raw of store.violations) {
    const v = normalizeViolation(raw);
    let attribution: DriverViolationAttribution | null = null;
    let related: Order | undefined;

    if (v.driverId === driverId) {
      attribution = "EXPLICIT";
      related = findRentalOrder(driverOrders, v) ?? driverOrders.find((o) => o.vehicleId === v.vehicleId);
    } else if (!v.driverId) {
      related = findRentalOrder(driverOrders, v);
      if (related) attribution = "RENTAL_PERIOD";
    }

    if (!attribution || seen.has(v.id)) continue;
    seen.add(v.id);

    items.push({
      ...v,
      attribution,
      relatedOrderId: related?.id,
      relatedOrderNo: related?.orderNo,
      paymentLabel: violationPaymentStatusLabel[v.status],
      handleLabel: violationHandleStatusLabel[v.handleStatus]
    });
  }

  items.sort((a, b) => b.violationTime.localeCompare(a.violationTime));
  return items;
};

export const buildDriverOrderHistory = (store: PreviewStore, driverId: string): DriverOrderHistoryItem[] =>
  store.orders
    .filter((o) => o.driverId === driverId)
    .sort((a, b) => b.pickupTime.localeCompare(a.pickupTime))
    .map((o) => ({
      id: o.id,
      orderNo: o.orderNo,
      plateNumber: o.plateNumber,
      serviceMode: o.serviceMode,
      status: o.status,
      statusLabel: orderStatusLabel[o.status] ?? o.status,
      serviceModeLabel: serviceModeLabel[o.serviceMode] ?? o.serviceMode,
      pickupTime: o.pickupTime,
      returnTime: o.returnTime,
      chauffeurFee: o.chauffeurFee,
      totalFee: o.totalFee
    }));

export const buildDriverAdminProfile = (
  store: PreviewStore,
  driverId: string
): DriverAdminProfile | null => {
  const driver = store.drivers.find((d) => d.id === driverId);
  if (!driver) return null;

  const orders = buildDriverOrderHistory(store, driverId);
  const violations = resolveDriverViolations(store, driverId);

  const stats: DriverAdminStats = {
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => COMPLETED_STATUSES.includes(o.status)).length,
    activeOrders: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    totalChauffeurFee: orders.reduce((sum, o) => sum + o.chauffeurFee, 0),
    violationTotal: violations.length,
    violationUnpaid: violations.filter((v) => v.status === "UNPAID").length,
    violationUnprocessed: violations.filter(
      (v) => v.handleStatus === "UNPROCESSED" || v.handleStatus === "IN_PROGRESS"
    ).length,
    violationPoints: violations.reduce((sum, v) => sum + v.points, 0)
  };

  return {
    driver,
    detail: buildDriverDetail(driver),
    stats,
    orders,
    violations
  };
};
