import { Outlet } from "react-router-dom";
import { previewStore } from "@rental-preview/shared";
import { PageTabs } from "../ui/page-tabs";
import { Badge } from "../ui/badge";

const orgTabs = [
  { to: "/orgs/customers", label: "企业客户" },
  { to: "/orgs/members", label: "企业用户" },
  { to: "/orgs/approvals", label: "开通审批" }
] as const;

export function OrgsLayout() {
  const customerCount = previewStore.orgs.length;
  const memberCount = previewStore.orgMembers.length;
  const pendingApprovals = previewStore.approvals.filter((a) => a.status === "PENDING").length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">企业与用户</h2>
        <p className="text-sm text-muted-foreground">
          FR-USER-006~017 · B/G 企业客户 · 企业成员 · 开通/账单审批
        </p>
      </div>

      <PageTabs
        tabs={orgTabs.map((t) => ({
          ...t,
          badge:
            t.to === "/orgs/customers" ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {customerCount}
              </Badge>
            ) : t.to === "/orgs/members" ? (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {memberCount}
              </Badge>
            ) : pendingApprovals > 0 ? (
              <Badge variant="warning" className="h-5 px-1.5 text-[10px]">
                {pendingApprovals}
              </Badge>
            ) : undefined
        }))}
        ariaLabel="企业与用户分区"
      />

      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
