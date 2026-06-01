import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  api,
  formatMoney,
  orgAccountTypeLabel,
  orgDataScopeLabel,
  orgMemberStatusLabel,
  orgRoleCodeLabel,
  orgStatusLabel,
  type OrgAccountDetail
} from "@rental-preview/shared";
import { PageTabs } from "../components/ui/page-tabs";
import { DataTable } from "../components/shared/DataTable";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const orgTabs = [
  { to: "/orgs/customers", label: "企业客户" },
  { to: "/orgs/members", label: "企业用户" },
  { to: "/orgs/approvals", label: "开通审批" }
];

export function OrgDetailPage() {
  const { orgId } = useParams();
  const [detail, setDetail] = useState<OrgAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const res = await api.get<OrgAccountDetail>(`/api/v1/admin/orgs/${orgId}/detail`);
    setDetail(res.ok && res.data ? res.data : null);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="text-sm text-muted-foreground">加载企业详情…</p>;

  if (!detail) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">企业不存在</p>
        <Link to="/orgs/customers" className="text-sm text-primary hover:underline">
          ← 返回企业列表
        </Link>
      </div>
    );
  }

  const { org, members, stats } = detail;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">企业与用户</h2>
        <p className="text-sm text-muted-foreground">企业详情 · {org.orgName}</p>
      </div>

      <PageTabs tabs={orgTabs} ariaLabel="企业与用户分区" />

      <Link to="/orgs/customers" className="inline-block text-sm text-primary hover:underline">
        ← 企业客户列表
      </Link>

      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{org.orgName}</h3>
            <p className="text-sm text-muted-foreground">
              {orgAccountTypeLabel[org.accountType]} · {orgStatusLabel[org.status]} · 信用代码 {org.creditCode}
            </p>
          </div>
          <Badge variant={org.status === "ACTIVE" ? "success" : "secondary"}>{orgStatusLabel[org.status]}</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <p className="text-muted-foreground">授信额度</p>
            <p className="font-medium">{formatMoney(org.creditLimit)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">已用额度 ({stats.creditUsagePercent}%)</p>
            <p className="font-medium">{formatMoney(org.usedAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">账期</p>
            <p className="font-medium">{org.billingPeriodDays} 天</p>
          </div>
          <div>
            <p className="text-muted-foreground">回款识别码</p>
            <p className="font-medium font-mono text-xs">{org.paymentReferenceCode ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">联系人</p>
            <p className="font-medium">
              {org.contactName} {org.contactPhone}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">成员</p>
            <p className="font-medium">
              {stats.activeMemberCount} 启用 / {stats.memberCount} 总计
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">待审批</p>
            <p className="font-medium">{stats.pendingApprovals} 项</p>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          刷新
        </Button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">企业用户（成员）</h3>
          <Link
            to="/orgs/members"
            className="text-xs text-primary hover:underline"
          >
            在「企业用户」中管理 →
          </Link>
        </div>
        <DataTable
          rows={members}
          columns={[
            { key: "name", header: "姓名", render: (r) => r.userName },
            { key: "phone", header: "手机", render: (r) => r.userPhone },
            { key: "dept", header: "部门", render: (r) => r.departmentName },
            {
              key: "roles",
              header: "角色",
              render: (r) => r.roleCodes.map((c) => orgRoleCodeLabel[c] ?? c).join("、")
            },
            { key: "scope", header: "范围", render: (r) => orgDataScopeLabel[r.dataScope] },
            {
              key: "st",
              header: "状态",
              render: (r) => (
                <Badge variant={r.status === "ACTIVE" ? "success" : r.status === "PENDING" ? "warning" : "secondary"}>
                  {orgMemberStatusLabel[r.status]}
                </Badge>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
