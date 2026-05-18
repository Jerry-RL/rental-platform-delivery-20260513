const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "待支付",
  PAYMENT_FAILED: "支付失败",
  CONFIRMED: "已确认",
  READY_FOR_PICKUP: "待提车",
  IN_USE: "使用中",
  RETURN_PENDING_SETTLEMENT: "待结算",
  SETTLED: "已结算",
  COMPLETED: "已完成",
  CANCELED: "已取消"
};

export const orderStatusLabel = (status: string) => ORDER_STATUS_LABELS[status] ?? status;
export const ORDER_STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS);
