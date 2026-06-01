import { Link } from "react-router-dom";
import {
  approvalStatusLabel,
  approvalTypeLabel,
  type OrgApprovalTask
} from "@rental-preview/shared";
import { AdminCrudPanel } from "../../components/shared/AdminCrudPanel";
import { approvalBatchActions, approvalCrudFields } from "../../lib/crud-fields";
import { Badge } from "../../components/ui/badge";
import { previewStore } from "@rental-preview/shared";

const orgName = (orgId: string) =>
  previewStore.orgs.find((o) => o.id === orgId)?.orgName ?? orgId.slice(0, 8);

export function OrgsApprovalsTab() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        成员开通 / 角色变更 / 账单确认审批 · 批量通过或驳回
      </p>
      <AdminCrudPanel<OrgApprovalTask>
        resource="approvals"
        listPath="/api/v1/admin/approvals"
        initialFilters={{ orgId: "", status: "", approvalType: "" }}
        filterFields={[
          {
            key: "status",
            label: "审批状态",
            type: "select",
            options: [
              { value: "PENDING", label: "待审批" },
              { value: "APPROVED", label: "已通过" },
              { value: "REJECTED", label: "已驳回" }
            ]
          },
          {
            key: "approvalType",
            label: "类型",
            type: "select",
            options: Object.entries(approvalTypeLabel).map(([value, label]) => ({ value, label }))
          }
        ]}
        formFields={approvalCrudFields}
        batchActions={approvalBatchActions}
        columns={[
          {
            key: "org",
            header: "企业",
            render: (r) => (
              <Link to={`/orgs/${r.orgId}`} className="text-primary hover:underline">
                {orgName(r.orgId)}
              </Link>
            )
          },
          { key: "type", header: "类型", render: (r) => approvalTypeLabel[r.approvalType] },
          {
            key: "status",
            header: "状态",
            render: (r) => (
              <Badge
                variant={
                  r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "warning" : "warning"
                }
              >
                {approvalStatusLabel[r.status]}
              </Badge>
            )
          },
          { key: "reason", header: "说明", render: (r) => r.reason ?? "—" },
          { key: "at", header: "提交时间", render: (r) => r.createdAt.slice(0, 16).replace("T", " ") }
        ]}
      />
    </div>
  );
}
