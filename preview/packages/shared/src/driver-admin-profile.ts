import { buildDriverDetail, type DriverDetailView } from "./driver-detail";
import { orderStatusLabel, serviceModeLabel } from "./labels";
import type { PreviewStore } from "./store";
import type { Driver, Order, OrderStatus, ServiceMode } from "./types";
import { listDriverViolations } from "./violation-attribution";

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
  violations: ReturnType<typeof listDriverViolations>;
};

const ACTIVE_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_USE",
  "RETURN_PENDING_SETTLEMENT"
];

const COMPLETED_STATUSES: OrderStatus[] = ["COMPLETED", "SETTLED"];

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
  const violations = listDriverViolations(store, driverId);

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
