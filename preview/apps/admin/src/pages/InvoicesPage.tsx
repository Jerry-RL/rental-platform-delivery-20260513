import { Link } from "react-router-dom";
import type { Invoice } from "@rental-preview/shared";
import { formatMoney, invoiceStatusLabel } from "@rental-preview/shared";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { invoiceCrudFields } from "../lib/crud-fields";

export function InvoicesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">电子发票</h2>
        <p className="text-sm text-muted-foreground">
          FR-FIN-002 · 开具后同步订单「已开发票」· 对照 docs 开票方案对比文档
        </p>
      </div>

      <Card>
        <CardContent className="pt-4 text-xs text-muted-foreground">
          <p>
            H5 申请发票（POST /api/v1/invoices）演示为即时开具；批量标记「已开具」后，有关联订单的将同步订单状态。
          </p>
        </CardContent>
      </Card>

      <AdminCrudPanel<Invoice>
        resource="invoices"
        listPath="/api/v1/invoices"
        formFields={invoiceCrudFields}
        batchActions={[{ label: "批量标记已开", patch: { status: "ISSUED" } }]}
        columns={[
          { key: "no", header: "发票号", render: (r) => r.invoiceNo ?? "待开具" },
          { key: "title", header: "抬头", render: (r) => r.invoiceTitle },
          {
            key: "order",
            header: "订单",
            render: (r) =>
              r.orderId ? (
                <Link to={`/orders/${r.orderId}`} className="text-primary hover:underline">
                  查看订单
                </Link>
              ) : (
                "—"
              )
          },
          {
            key: "status",
            header: "状态",
            render: (r) => (
              <Badge variant={r.status === "ISSUED" ? "success" : "warning"}>
                {invoiceStatusLabel[r.status]}
              </Badge>
            )
          },
          { key: "amt", header: "金额", render: (r) => formatMoney(r.amount) }
        ]}
      />
    </div>
  );
}
