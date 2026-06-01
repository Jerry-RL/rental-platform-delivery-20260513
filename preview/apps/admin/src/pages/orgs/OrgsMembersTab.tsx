import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  orgDataScopeLabel,
  orgMemberStatusLabel,
  orgRoleCodeLabel,
  type OrgAccount,
  type OrgMemberEnriched,
  type PageResult
} from "@rental-preview/shared";
import { AdminCrudPanel } from "../../components/shared/AdminCrudPanel";
import {
  getOrgMemberCrudFields,
  orgMemberEditFields,
  orgMemberFilterFields
} from "../../lib/crud-fields";
import { Badge } from "../../components/ui/badge";

export function OrgsMembersTab() {
  const [orgs, setOrgs] = useState<OrgAccount[]>([]);

  useEffect(() => {
    void api.get<PageResult<OrgAccount>>("/api/v1/orgs?pageSize=100").then((res) => {
      if (res.ok && res.data) setOrgs(res.data.items);
    });
  }, []);

  const orgOptions = useMemo(
    () => orgs.map((o) => ({ value: o.id, label: o.orgName })),
    [orgs]
  );

  const memberCrudFields = useMemo(() => getOrgMemberCrudFields(orgOptions), [orgOptions]);

  const formatRoles = (codes: string[]) =>
    codes.map((c) => orgRoleCodeLabel[c] ?? c).join("、");

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        POST /api/v1/admin/org-members · 手机号关联或自动创建 C 端账号 · 加入企业
      </p>
      <AdminCrudPanel<OrgMemberEnriched>
        resource="org-members"
        listPath="/api/v1/admin/org-members"
        initialFilters={{ orgName: "", phone: "", departmentName: "", status: "" }}
        filterFields={orgMemberFilterFields}
        formFields={memberCrudFields}
        editFormFields={orgMemberEditFields}
        prepareEditValues={(row) => ({
          ...row,
          roleCodes: row.roleCodes.join(", ")
        })}
        batchActions={[
          { label: "批量启用", patch: { status: "ACTIVE" } },
          { label: "批量禁用", patch: { status: "DISABLED" } }
        ]}
        columns={[
          {
            key: "org",
            header: "所属企业",
            render: (r) => (
              <Link to={`/orgs/${r.orgId}`} className="text-primary hover:underline">
                {r.orgName}
              </Link>
            )
          },
          {
            key: "user",
            header: "用户",
            render: (r) => (
              <div>
                <p>{r.userName}</p>
                <p className="text-xs text-muted-foreground">{r.userPhone}</p>
              </div>
            )
          },
          { key: "dept", header: "部门", render: (r) => r.departmentName },
          { key: "roles", header: "角色", render: (r) => formatRoles(r.roleCodes) },
          { key: "scope", header: "数据范围", render: (r) => orgDataScopeLabel[r.dataScope] },
          {
            key: "status",
            header: "状态",
            render: (r) => (
              <Badge
                variant={
                  r.status === "ACTIVE" ? "success" : r.status === "PENDING" ? "warning" : "secondary"
                }
              >
                {orgMemberStatusLabel[r.status]}
              </Badge>
            )
          }
        ]}
      />
    </div>
  );
}
