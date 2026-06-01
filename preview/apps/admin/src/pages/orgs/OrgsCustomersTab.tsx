import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  formatMoney,
  orgAccountTypeLabel,
  orgStatusLabel,
  type OrgAccount,
  type PageResult
} from "@rental-preview/shared";
import { AdminCrudPanel } from "../../components/shared/AdminCrudPanel";
import { orgCrudFields, orgFilterFields } from "../../lib/crud-fields";
import { Badge } from "../../components/ui/badge";

export function OrgsCustomersTab() {
  const [orgOptions, setOrgOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    void api.get<PageResult<OrgAccount>>("/api/v1/orgs?pageSize=100").then((res) => {
      if (res.ok && res.data) {
        setOrgOptions(
          res.data.items.map((o) => ({
            value: o.id,
            label: `${o.orgName}（${orgAccountTypeLabel[o.accountType]}）`
          }))
        );
      }
    });
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        GET /api/v1/orgs · 管理 B/G 企业客户授信与回款码 · 点击进入企业详情
      </p>
      <AdminCrudPanel<OrgAccount>
        resource="orgs"
        listPath="/api/v1/orgs"
        initialFilters={{ orgName: "", accountType: "", status: "" }}
        filterFields={orgFilterFields}
        formFields={orgCrudFields}
        batchActions={[
          { label: "批量冻结", patch: { status: "FROZEN" } },
          { label: "批量启用", patch: { status: "ACTIVE" } }
        ]}
        columns={[
          {
            key: "name",
            header: "企业名称",
            render: (r) => (
              <Link to={`/orgs/${r.id}`} className="text-primary hover:underline">
                {r.orgName}
              </Link>
            )
          },
          {
            key: "type",
            header: "类型",
            render: (r) => (
              <Badge variant="outline">{orgAccountTypeLabel[r.accountType]}</Badge>
            )
          },
          {
            key: "status",
            header: "状态",
            render: (r) => (
              <Badge variant={r.status === "ACTIVE" ? "success" : r.status === "FROZEN" ? "warning" : "secondary"}>
                {orgStatusLabel[r.status]}
              </Badge>
            )
          },
          {
            key: "credit",
            header: "授信使用",
            render: (r) => {
              const pct = r.creditLimit > 0 ? Math.round((r.usedAmount / r.creditLimit) * 100) : 0;
              return (
                <span className={pct > 80 ? "text-warning" : ""}>
                  {formatMoney(r.usedAmount)} / {formatMoney(r.creditLimit)} ({pct}%)
                </span>
              );
            }
          },
          { key: "contact", header: "联系人", render: (r) => `${r.contactName} ${r.contactPhone}` },
          { key: "code", header: "回款码", render: (r) => r.paymentReferenceCode ?? "—" },
          {
            key: "detail",
            header: "操作",
            render: (r) => (
              <Link to={`/orgs/${r.id}`} className="text-xs text-muted-foreground hover:text-primary">
                查看详情
              </Link>
            )
          }
        ]}
      />
      {orgOptions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          共 {orgOptions.length} 家企业；在「企业用户」Tab 可为上述企业添加成员。
        </p>
      )}
    </div>
  );
}
