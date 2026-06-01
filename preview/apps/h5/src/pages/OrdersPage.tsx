import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  formatMoney,
  getPreviewUserId,
  orderStatusLabel,
  serviceModeLabel,
  type Order,
  type PageResult
} from "@rental-preview/shared";
import { OrderQuickActions } from "../components/OrderQuickActions";
import { cn } from "../lib/utils";

type OrderFilter = "all" | "pending" | "active" | "done";

const FILTER_TABS: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待付款" },
  { key: "active", label: "进行中" },
  { key: "done", label: "已完成" }
];

const matchFilter = (o: Order, filter: OrderFilter): boolean => {
  if (filter === "all") return true;
  if (filter === "pending") {
    return o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_FAILED";
  }
  if (filter === "active") {
    return ["CONFIRMED", "READY_FOR_PICKUP", "IN_USE", "RETURN_PENDING_SETTLEMENT"].includes(
      o.status
    );
  }
  return [
    "SETTLED",
    "COMPLETED",
    "INVOICE_PENDING",
    "INVOICE_ISSUED",
    "REFUND_SUCCESS",
    "REFUND_PARTIAL",
    "CANCELED"
  ].includes(o.status);
};

const fmtShort = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
  } catch {
    return iso;
  }
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const userId = getPreviewUserId();

  const load = useCallback(async () => {
    const res = await api.get<PageResult<Order>>(`/api/v1/orders?userId=${userId ?? ""}&pageSize=50`);
    if (res.ok && res.data) setOrders(res.data.items);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => orders.filter((o) => matchFilter(o, filter)),
    [orders, filter]
  );

  const handlePay = async (order: Order) => {
    await api.post("/api/v1/payments", {
      orderId: order.id,
      amount: order.totalFee - order.paidAmount,
      channel: "wechat",
      settlementMode: order.settlementMode
    });
    void load();
  };

  const handleConfirmPickup = async (order: Order) => {
    const res = await api.put<Order>(`/api/v1/orders/${order.id}/pickup`);
    if (res.ok) void load();
    else alert(res.error ?? res.raw?.message ?? "操作失败");
  };

  const handleInvoice = async (order: Order) => {
    await api.post("/api/v1/invoices", {
      orderId: order.id,
      titleType: "PERSONAL",
      invoiceTitle: "个人"
    });
    void load();
  };

  return (
    <div className="space-y-3 p-4 pb-6">
      <h2 className="text-lg font-bold">我的订单</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
              filter === tab.key
                ? "bg-primary/10 font-medium text-primary"
                : "bg-muted text-muted-foreground"
            )}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {orders.length === 0 ? "暂无订单" : "该分类下暂无订单"}
        </p>
      )}

      {filtered.map((o) => {
        const unpaid = Math.max(0, o.totalFee - o.paidAmount);
        return (
          <div
            key={o.id}
            className="card-surface overflow-hidden"
          >
            <Link to={`/orders/${o.id}`} className="block p-4 active:bg-muted/30">
              <div className="flex justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-medium">{o.plateNumber}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">
                    {serviceModeLabel[o.serviceMode]}
                  </span>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs",
                    o.incidentPending ? "text-warning" : "text-muted-foreground"
                  )}
                >
                  {orderStatusLabel[o.status]}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{o.orderNo}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fmtShort(o.pickupTime)} — {fmtShort(o.returnTime)}
              </p>
              <p className="mt-2 text-primary font-semibold">{formatMoney(o.totalFee)}</p>
            </Link>
            <div className="border-t border-border/80 bg-muted/20 px-4 py-2.5">
              <OrderQuickActions
                compact
                order={o}
                unpaid={unpaid}
                onPay={() => void handlePay(o)}
                onConfirmPickup={() => void handleConfirmPickup(o)}
                onInvoice={() => void handleInvoice(o)}
                onIncident={() => alert("请进入订单详情上报事故（演示）")}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
