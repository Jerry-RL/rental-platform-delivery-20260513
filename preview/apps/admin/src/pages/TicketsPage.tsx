import type { ServiceTicket } from "@rental-preview/shared";
import { ticketStatusLabel } from "@rental-preview/shared";
import { Badge } from "../components/ui/badge";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { ticketBatchActions, ticketCrudFields } from "../lib/crud-fields";

export function TicketsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">客服工单</h2>
        <p className="text-sm text-muted-foreground">FR-CS-001 · 增删改查 · 批量分派/结案</p>
      </div>
      <AdminCrudPanel<ServiceTicket>
        resource="tickets"
        listPath="/api/v1/admin/tickets"
        formFields={ticketCrudFields}
        batchActions={ticketBatchActions}
        columns={[
          { key: "no", header: "工单号", render: (r) => r.ticketNo },
          { key: "cat", header: "分类", render: (r) => r.category },
          { key: "sub", header: "主题", render: (r) => r.subject },
          {
            key: "pri",
            header: "优先级",
            render: (r) => (
              <Badge variant={r.priority === "HIGH" || r.priority === "URGENT" ? "warning" : "secondary"}>
                {r.priority}
              </Badge>
            )
          },
          { key: "status", header: "状态", render: (r) => ticketStatusLabel[r.status] }
        ]}
      />
    </div>
  );
}
