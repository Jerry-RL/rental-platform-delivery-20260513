import { Link } from "react-router-dom";
import type { PageResult, Payment, Refund } from "@rental-preview/shared";
import { formatMoney, paymentStatusLabel, refundStatusLabel } from "@rental-preview/shared";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { CollapsibleSection } from "../components/ui/collapsible";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { DataTable } from "../components/shared/DataTable";
import { refundBatchActions, refundCrudFields } from "../lib/crud-fields";
import { usePreviewApi } from "../hooks/usePreviewApi";

export function PaymentsPage() {
  const payments = usePreviewApi<PageResult<Payment>>("/api/v1/payments");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">支付与退款</h2>
        <p className="text-sm text-muted-foreground">
          FR-PAY · 退款审核/完成将同步订单状态为「退款处理中/退款成功」
        </p>
      </div>

      <Card>
        <CardContent className="pt-4 text-xs text-muted-foreground">
          <p>
            将退款单状态改为 <strong className="text-foreground">已退款（COMPLETED）</strong>{" "}
            后，关联订单自动同步为「退款成功」或「部分退款」（见{" "}
            <code className="text-foreground">order-status.ts</code>）。
          </p>
        </CardContent>
      </Card>

      <CollapsibleSection title="支付流水（只读）" defaultOpen>
        <DataTable
          rows={payments.data?.items ?? []}
          columns={[
            {
              key: "order",
              header: "订单",
              render: (r) => (
                <Link to={`/orders/${r.orderId}`} className="text-primary hover:underline">
                  {r.orderId.slice(0, 8)}…
                </Link>
              )
            },
            { key: "channel", header: "渠道", render: (r) => r.channel },
            {
              key: "status",
              header: "状态",
              render: (r) => (
                <Badge variant={r.status === "SUCCESS" ? "success" : "warning"}>
                  {paymentStatusLabel[r.status]}
                </Badge>
              )
            },
            { key: "amt", header: "金额", render: (r) => formatMoney(r.amount) }
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="退款管理" description="POST /api/v1/admin/refunds" defaultOpen>
        <AdminCrudPanel<Refund>
          resource="refunds"
          listPath="/api/v1/admin/refunds"
          formFields={refundCrudFields}
          batchActions={refundBatchActions}
          columns={[
            {
              key: "order",
              header: "订单",
              render: (r) => (
                <Link to={`/orders/${r.orderId}`} className="text-primary hover:underline">
                  {r.orderId.slice(0, 12)}…
                </Link>
              )
            },
            { key: "reason", header: "原因", render: (r) => r.reason },
            {
              key: "status",
              header: "状态",
              render: (r) => (
                <Badge variant={r.status === "COMPLETED" ? "success" : "warning"}>
                  {refundStatusLabel[r.status]}
                </Badge>
              )
            },
            { key: "amt", header: "金额", render: (r) => formatMoney(r.amount) }
          ]}
        />
      </CollapsibleSection>
    </div>
  );
}
