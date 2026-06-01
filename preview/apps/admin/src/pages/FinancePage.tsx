import { useState } from "react";
import { api, IDS, type BankTransaction, type Bill, type PageResult } from "@rental-preview/shared";
import { billStatusLabel, formatMoney } from "@rental-preview/shared";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CollapsibleSection } from "../components/ui/collapsible";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { DataTable } from "../components/shared/DataTable";
import { billCrudFields } from "../lib/crud-fields";
import { usePreviewApi } from "../hooks/usePreviewApi";

export function FinancePage() {
  const bank = usePreviewApi<PageResult<BankTransaction>>("/api/v1/admin/bank-transactions");
  const [msg, setMsg] = useState("");

  const handleConfirm = async (bill: Bill) => {
    const res = await api.put<Bill>(`/api/v1/bills/${bill.id}/confirm`, {
      confirmedBy: IDS.userB,
      confirmRemark: "预览确认"
    });
    setMsg(res.ok ? "账单已确认，进入待付款" : res.error ?? "失败");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">财务与对公勾稽</h2>
        <p className="text-sm text-muted-foreground">FR-FIN · 账单 CRUD · 确认 · 流水只读</p>
      </div>
      {msg && <p className="text-sm text-primary">{msg}</p>}

      <CollapsibleSection title="月结账单" defaultOpen>
        <AdminCrudPanel<Bill>
          resource="bills"
          listPath="/api/v1/bills"
          formFields={billCrudFields}
          batchActions={[{ label: "批量待付款", patch: { status: "PENDING_PAYMENT" } }]}
          columns={[
            { key: "no", header: "账单号", render: (r) => r.billNo },
            { key: "period", header: "账期", render: (r) => r.billingPeriod },
            {
              key: "status",
              header: "状态",
              render: (r) => <Badge variant="outline">{billStatusLabel[r.status]}</Badge>
            },
            {
              key: "amt",
              header: "应付/已付",
              render: (r) => `${formatMoney(r.paidAmount)} / ${formatMoney(r.totalAmount)}`
            },
            {
              key: "act",
              header: "确认",
              render: (r) =>
                r.status === "PENDING_CONFIRM" ? (
                  <Button type="button" size="sm" variant="outline" onClick={() => void handleConfirm(r)}>
                    确认
                  </Button>
                ) : (
                  "—"
                )
            }
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="银行流水（只读）" defaultOpen={false}>
        <DataTable
          rows={bank.data?.items ?? []}
          columns={[
            { key: "txn", header: "流水号", render: (r) => r.txnNo },
            { key: "payer", header: "付款方", render: (r) => r.payerName },
            { key: "amt", header: "金额", render: (r) => formatMoney(r.amount) },
            {
              key: "match",
              header: "匹配",
              render: (r) => (
                <Badge variant={r.status === "MATCHED" ? "success" : "warning"}>
                  {r.status === "MATCHED" ? "已匹配" : "待认领"}
                </Badge>
              )
            }
          ]}
        />
      </CollapsibleSection>
    </div>
  );
}
