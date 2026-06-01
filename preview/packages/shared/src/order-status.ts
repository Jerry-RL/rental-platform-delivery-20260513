import type { PreviewStore } from "./store";
import type { Order, OrderStatus } from "./types";

/** 履约主流程（状态机推进） */
export const orderFulfillmentSteps: OrderStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "IN_USE",
  "RETURN_PENDING_SETTLEMENT",
  "SETTLED",
  "COMPLETED"
];

/** 财务延伸状态（发票 / 退款，由业务单据驱动） */
export const orderFinancialStatuses: OrderStatus[] = [
  "INVOICE_ISSUED",
  "REFUND_PENDING",
  "REFUND_PARTIAL",
  "REFUND_SUCCESS"
];

export const isFinancialOrderStatus = (s: OrderStatus) => orderFinancialStatuses.includes(s);

export type OrderStatusBadge = {
  key: string;
  label: string;
  tone: "default" | "success" | "warning" | "muted";
};

/** 根据支付/退款/发票同步订单展示状态（优先级：退款 > 发票 > 原履约状态） */
export const syncOrderStatusFromRelations = (store: PreviewStore, order: Order): Order => {
  const refunds = store.refunds.filter((r) => r.orderId === order.id);
  const invoices = store.invoices.filter((i) => i.orderId === order.id);
  const paid = order.paidAmount;

  if (refunds.some((r) => r.status === "COMPLETED")) {
    const completedSum = refunds
      .filter((r) => r.status === "COMPLETED")
      .reduce((s, r) => s + r.amount, 0);
    return {
      ...order,
      status: paid > 0 && completedSum < paid ? "REFUND_PARTIAL" : "REFUND_SUCCESS"
    };
  }
  if (refunds.some((r) => r.status === "PENDING" || r.status === "APPROVED")) {
    return { ...order, status: "REFUND_PENDING" };
  }
  if (invoices.some((i) => i.status === "ISSUED")) {
    return { ...order, status: "INVOICE_ISSUED" };
  }
  if (invoices.some((i) => i.status === "PENDING") && ["SETTLED", "COMPLETED"].includes(order.status)) {
    return { ...order, status: "INVOICE_PENDING" as OrderStatus };
  }

  return order;
};

export const buildOrderStatusBadges = (
  store: PreviewStore,
  order: Order
): OrderStatusBadge[] => {
  const badges: OrderStatusBadge[] = [];
  const refunds = store.refunds.filter((r) => r.orderId === order.id);
  const invoices = store.invoices.filter((i) => i.orderId === order.id);

  if (order.incidentPending) {
    badges.push({ key: "incident", label: "事故待结", tone: "warning" });
  }
  if (invoices.some((i) => i.status === "ISSUED")) {
    badges.push({ key: "invoice", label: "已开发票", tone: "success" });
  } else if (invoices.some((i) => i.status === "PENDING")) {
    badges.push({ key: "invoice-p", label: "开票中", tone: "muted" });
  }
  if (refunds.some((r) => r.status === "COMPLETED")) {
    const sum = refunds.filter((r) => r.status === "COMPLETED").reduce((s, r) => s + r.amount, 0);
    badges.push({
      key: "refund-ok",
      label: sum >= order.paidAmount ? "退款成功" : "部分退款",
      tone: "success"
    });
  } else if (refunds.some((r) => r.status === "PENDING")) {
    badges.push({ key: "refund-p", label: "退款处理中", tone: "warning" });
  }

  return badges;
};

export const getFulfillmentStepIndex = (status: OrderStatus) => {
  if (isFinancialOrderStatus(status) || status === "INVOICE_PENDING") {
    return orderFulfillmentSteps.indexOf("SETTLED");
  }
  if (status === "PAYMENT_FAILED" || status === "CANCELED") return -1;
  const idx = orderFulfillmentSteps.indexOf(status);
  return idx >= 0 ? idx : orderFulfillmentSteps.length - 1;
};

/** 写回 store 中订单状态（发票/退款变更后调用） */
export const reconcileOrderStatusInStore = (store: PreviewStore, orderId: string): void => {
  const idx = store.orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return;
  store.orders[idx] = syncOrderStatusFromRelations(store, store.orders[idx]);
};

export const reconcileAllOrderStatuses = (store: PreviewStore): void => {
  store.orders = store.orders.map((o) => syncOrderStatusFromRelations(store, o));
};
