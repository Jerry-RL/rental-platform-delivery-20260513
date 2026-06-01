import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  api,
  getFulfillmentStepIndex,
  isFinancialOrderStatus,
  orderFulfillmentSteps,
  type Order,
  type OrderDetail
} from "@rental-preview/shared";
import { OrderDetailView } from "../components/shared/OrderDetailView";
import { Button } from "../components/ui/button";

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    const res = await api.get<OrderDetail>(`/api/v1/orders/${orderId}`);
    setDetail(res.ok && res.data ? res.data : null);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdvance = async () => {
    if (!detail) return;
    const order = detail.order;
    if (isFinancialOrderStatus(order.status) || order.status === "INVOICE_PENDING") return;
    const idx = getFulfillmentStepIndex(order.status);
    const next = orderFulfillmentSteps[Math.min(idx + 1, orderFulfillmentSteps.length - 1)];
    if (idx < 0 || next === order.status) return;
    setAdvancing(true);
    const res = await api.patch<Order>(`/api/v1/orders/${order.id}/status`, { status: next });
    setAdvancing(false);
    if (res.ok) void load();
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">加载订单详情…</p>;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">订单不存在或已删除</p>
        <Button type="button" variant="outline" onClick={() => navigate("/orders")}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/orders" className="text-primary hover:underline">
          ← 订单列表
        </Link>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">FR-ORD · GET /api/v1/orders/:id</p>
      </div>
      <OrderDetailView detail={detail} onAdvanceStatus={() => void handleAdvance()} advancing={advancing} />
    </div>
  );
}
