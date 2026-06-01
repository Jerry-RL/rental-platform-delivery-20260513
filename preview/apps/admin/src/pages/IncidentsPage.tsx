import { Link } from "react-router-dom";
import { formatMoney, type UserIncidentView } from "@rental-preview/shared";
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
      <AdminCrudPanel<UserIncidentView>
        resource="incidents"
        listPath="/api/v1/admin/incidents"
        formFields={incidentCrudFields}
        batchActions={[
          { label: "批量审核中", patch: { status: "UNDER_REVIEW" } },
          { label: "批量结案", patch: { status: "CLOSED" } }
        ]}
        columns={[
          { key: "order", header: "订单", render: (r) => r.orderNo ?? "—" },
          { key: "plate", header: "车牌", render: (r) => r.plateNumber ?? "—" },
          { key: "type", header: "类型", render: (r) => r.incidentType },
          { key: "ctx", header: "场景", render: (r) => r.serviceContextLabel },
          { key: "party", header: "责任", render: (r) => r.responsiblePartyLabel },
          { key: "loc", header: "地点", render: (r) => r.location },
          {
            key: "status",
            header: "状态",
            render: (r) => <Badge variant="warning">{r.statusLabel}</Badge>
          },
          {
            key: "cost",
            header: "预估",
            render: (r) => (r.estimatedCost > 0 ? formatMoney(r.estimatedCost) : "—")
          },
          { key: "pause", header: "暂停计费", render: (r) => (r.pauseBilling ? "是" : "否") },
          {
            key: "detail",
            header: "操作",
            render: (r) => (
              <Link to={`/incidents/${r.id}`} className="text-sm text-primary hover:underline">
                详情
              </Link>
            )
          }
        ]}
      />
    </div>
  );
}
