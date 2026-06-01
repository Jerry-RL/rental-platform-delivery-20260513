import type { PreviewStore } from "./store";
import type { Order, OrderStatus, ServiceMode } from "./types";

/** 履约主状态机（与 OpenAPI / rental-platform order router 一致） */
const FULFILLMENT_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING_PAYMENT: ["PAYMENT_FAILED", "CONFIRMED", "CANCELED"],
  PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELED"],
  CONFIRMED: ["READY_FOR_PICKUP", "CANCELED"],
  READY_FOR_PICKUP: ["IN_USE"],
  IN_USE: ["RETURN_PENDING_SETTLEMENT"],
  RETURN_PENDING_SETTLEMENT: ["SETTLED"],
  SETTLED: ["COMPLETED"],
  COMPLETED: []
};

export const canTransitionOrderStatus = (from: OrderStatus, to: OrderStatus): boolean =>
  FULFILLMENT_TRANSITIONS[from]?.includes(to) ?? false;

export const isPrepaidSettledForPickup = (order: Order): boolean =>
  order.settlementMode === "POSTPAID" || order.paidAmount >= order.totalFee;

export const canConfirmOrderPickup = (order: Order): boolean => {
  if (!["CONFIRMED", "READY_FOR_PICKUP"].includes(order.status)) return false;
  if (!isPrepaidSettledForPickup(order)) return false;
  if (order.serviceMode === "WITH_DRIVER" && !order.driverId) return false;
  return true;
};

/** 统一 C 端主按钮文案（自驾取车 / 包车出车） */
export const CONFIRM_SERVICE_START_LABEL = "确认租车服务开始";

export const getConfirmPickupLabel = (): string => CONFIRM_SERVICE_START_LABEL;

export const getConfirmPickupHint = (serviceMode: ServiceMode): string =>
  serviceMode === "WITH_DRIVER"
    ? "包车：请确认司机已接您出车，确认后订单进入使用中并开始计费。"
    : "自驾：请确认已在门店完成验车并取车，确认后订单进入使用中。";

export const getConfirmPickupDialogMessage = (serviceMode: ServiceMode): string =>
  `确认租车服务已开始？\n\n${
    serviceMode === "WITH_DRIVER"
      ? "包车：请确认司机已为您提供服务。"
      : "自驾：请确认您已完成门店验车并取车。"
  }\n\n确认后订单将进入使用中。`;

export type ApplyPickupResult =
  | { ok: true; order: Order; message: string }
  | { ok: false; code: number; message: string };

/** PUT /orders/:id/pickup — CONFIRMED→待提车→使用中，或 READY_FOR_PICKUP→使用中 */
export const applyOrderPickup = (store: PreviewStore, orderId: string): ApplyPickupResult => {
  const idx = store.orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return { ok: false, code: 1004, message: "订单不存在" };

  const order = store.orders[idx];
  if (!canConfirmOrderPickup(order)) {
    if (order.settlementMode === "PREPAID" && order.paidAmount < order.totalFee) {
      return { ok: false, code: 5002, message: "请先完成支付后再确认取车" };
    }
    if (order.serviceMode === "WITH_DRIVER" && !order.driverId) {
      return { ok: false, code: 5003, message: "包车订单须先分配司机" };
    }
    return { ok: false, code: 5001, message: "当前订单状态不可确认取车/开始服务" };
  }

  let status = order.status;
  const first: OrderStatus = status === "CONFIRMED" ? "READY_FOR_PICKUP" : "IN_USE";
  if (!canTransitionOrderStatus(status, first)) {
    return { ok: false, code: 5001, message: "当前订单状态不可确认取车/开始服务" };
  }
  status = first;
  if (status === "READY_FOR_PICKUP") {
    if (!canTransitionOrderStatus(status, "IN_USE")) {
      return { ok: false, code: 5001, message: "提车状态推进失败" };
    }
    status = "IN_USE";
  }

  const vehicle = store.vehicles.find((v) => v.id === order.vehicleId);
  if (vehicle) vehicle.status = "IN_USE";

  if (order.driverId) {
    const driver = store.drivers.find((d) => d.id === order.driverId);
    if (driver) driver.status = "ON_DUTY";
  }

  const updated: Order = { ...order, status };
  store.orders[idx] = updated;

  return { ok: true, order: updated, message: "租车服务已开始，订单使用中" };
};
