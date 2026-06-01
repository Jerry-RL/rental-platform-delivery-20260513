import type { Incident } from "@rental-preview/shared";
import { formatMoney, incidentStatusLabel } from "@rental-preview/shared";
import { Badge } from "../components/ui/badge";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { incidentCrudFields } from "../lib/crud-fields";

export function IncidentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">事故处理</h2>
        <p className="text-sm text-muted-foreground">FR-ORD-008~012 · 暂停计费 · 状态流转</p>
      </div>
      <AdminCrudPanel<Incident>
        resource="incidents"
        listPath="/api/v1/admin/incidents"
        formFields={incidentCrudFields}
        batchActions={[
          { label: "批量审核中", patch: { status: "UNDER_REVIEW" } },
          { label: "批量结案", patch: { status: "CLOSED" } }
        ]}
        columns={[
          { key: "order", header: "订单", render: (r) => r.orderId.slice(0, 12) + "…" },
          { key: "type", header: "类型", render: (r) => r.incidentType },
          { key: "loc", header: "地点", render: (r) => r.location },
          {
            key: "status",
            header: "状态",
            render: (r) => <Badge variant="warning">{incidentStatusLabel[r.status]}</Badge>
          },
          { key: "cost", header: "预估", render: (r) => formatMoney(r.estimatedCost) },
          { key: "pause", header: "暂停计费", render: (r) => (r.pauseBilling ? "是" : "否") }
        ]}
      />
    </div>
  );
}
