import { isoToLocalInputValue } from "./datetime";
import { canConfirmOrderPickup, getConfirmPickupLabel } from "./order-fulfillment";
import type { Order, OrderStatus, Store, Vehicle } from "./types";

/** 允许「再次下单」的订单状态（已结束或已取消类） */
export const REORDER_ELIGIBLE_STATUSES: OrderStatus[] = [
  "COMPLETED",
  "SETTLED",
  "INVOICE_PENDING",
  "INVOICE_ISSUED",
  "REFUND_SUCCESS",
  "REFUND_PARTIAL",
  "CANCELED"
];

export type OrderQuickActionId =
  | "reorder"
  | "pay"
  | "confirm_pickup"
  | "invoice"
  | "incident"
  | "contact"
  | "view_detail";

export type OrderQuickAction = {
  id: OrderQuickActionId;
  label: string;
  primary?: boolean;
  destructive?: boolean;
};

export const canReorderOrder = (order: Order): boolean =>
  REORDER_ELIGIBLE_STATUSES.includes(order.status);

export type OrderQuickActionContext = {
  unpaid?: number;
  hasIssuedInvoice?: boolean;
};

export const getOrderQuickActions = (
  order: Order,
  ctx: OrderQuickActionContext = {}
): OrderQuickAction[] => {
  const actions: OrderQuickAction[] = [];

  if (order.status === "PENDING_PAYMENT" || order.status === "PAYMENT_FAILED") {
    actions.push({
      id: "pay",
      label: ctx.unpaid && ctx.unpaid > 0 ? "去支付" : "去支付",
      primary: true
    });
  }

  if (order.status === "IN_USE") {
    actions.push({ id: "incident", label: "上报事故", destructive: true });
    actions.push({ id: "contact", label: "联系门店" });
  }

  if (canConfirmOrderPickup(order)) {
    actions.push({
      id: "confirm_pickup",
      label: getConfirmPickupLabel(),
      primary: true
    });
  }

  if (["CONFIRMED", "READY_FOR_PICKUP"].includes(order.status)) {
    actions.push({ id: "contact", label: "联系门店" });
  }

  if (
    ["SETTLED", "COMPLETED", "INVOICE_PENDING"].includes(order.status) &&
    !ctx.hasIssuedInvoice
  ) {
    actions.push({ id: "invoice", label: "申请发票" });
  }

  if (canReorderOrder(order)) {
    const hasPrimary = actions.some((a) => a.primary);
    actions.push({
      id: "reorder",
      label: "再次下单",
      primary: !hasPrimary
    });
  }

  return actions;
};

export type ReorderVehicleInfo = Pick<
  Vehicle,
  "id" | "vehicleTypeId" | "brand" | "model" | "city" | "status"
>;

/** 生成再次下单跳转 `/booking` 的 query（预填车辆、服务方式、门店） */
export const buildReorderBookingSearch = (
  order: Order,
  vehicle: ReorderVehicleInfo | null,
  pickupStore?: Pick<Store, "city"> | null
): string => {
  const params = new URLSearchParams();
  const city = pickupStore?.city ?? vehicle?.city ?? "上海";
  params.set("city", city);
  params.set("vehicleTypeId", order.vehicleTypeId);
  if (vehicle?.id) params.set("vehicleId", vehicle.id);
  if (vehicle?.brand) params.set("brand", vehicle.brand);
  if (vehicle?.model) params.set("model", vehicle.model);
  params.set("serviceMode", order.serviceMode);
  params.set("settlementMode", order.settlementMode);
  params.set("pickupStoreId", order.pickupStoreId);
  params.set("returnStoreId", order.returnStoreId);
  params.set("pickupTime", isoToLocalInputValue(order.pickupTime, 1));
  params.set("returnTime", isoToLocalInputValue(order.returnTime, 3));
  params.set("reorder", "1");
  return params.toString();
};

/** 按更新时间取最近可再次下单的订单（演示用） */
export const pickRecentReorderableOrders = (
  orders: Order[],
  limit = 3
): Order[] =>
  [...orders]
    .filter(canReorderOrder)
    .sort((a, b) => b.pickupTime.localeCompare(a.pickupTime))
    .slice(0, limit);
