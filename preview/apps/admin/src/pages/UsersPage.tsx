import { useState } from "react";
import type { User, UserLicenseRecord } from "@rental-preview/shared";
import { api, licenseRoleLabel, licenseVerifyStatusLabel, SERVICE_MODE_META } from "@rental-preview/shared";
import { Badge } from "../components/ui/badge";
import { ListFilterForm } from "../components/shared/ListFilterForm";
import { DataTable } from "../components/shared/DataTable";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { userBatchActions, userCrudFields } from "../lib/crud-fields";
import { CollapsibleSection } from "../components/ui/collapsible";
import { useFilteredList } from "../hooks/useFilteredList";

const userFilterFields = [
  { key: "phone", label: "手机号", type: "text" as const, placeholder: "138" },
  {
    key: "realNameStatus",
    label: "实名状态",
    type: "select" as const,
    options: [
      { value: "APPROVED", label: "已通过" },
      { value: "PENDING", label: "待审核" },
      { value: "NONE", label: "未提交" }
    ]
  },
  {
    key: "licenseStatus",
    label: "驾照效力",
    type: "select" as const,
    options: [
      { value: "VALID", label: "有效" },
      { value: "EXPIRED", label: "已过期" },
      { value: "NONE", label: "未认证" }
    ]
  },
  {
    key: "licenseVerifyStatus",
    label: "驾照审核",
    type: "select" as const,
    options: [
      { value: "APPROVED", label: "已通过" },
      { value: "PENDING", label: "待审核" },
      { value: "REJECTED", label: "已驳回" },
      { value: "NONE", label: "未提交" }
    ]
  },
  {
    key: "status",
    label: "账户状态",
    type: "select" as const,
    options: [
      { value: "ACTIVE", label: "正常" },
      { value: "SUSPENDED", label: "冻结" },
      { value: "BLACKLIST", label: "黑名单" }
    ]
  }
];

const licenseFilterFields = [
  {
    key: "verifyStatus",
    label: "审核状态",
    type: "select" as const,
    options: [
      { value: "PENDING", label: "待审核" },
      { value: "APPROVED", label: "已通过" },
      { value: "REJECTED", label: "已驳回" }
    ]
  },
  { key: "phone", label: "用户手机", type: "text" as const, placeholder: "136" }
];

type LicenseAdminRow = UserLicenseRecord & { userPhone?: string; userRealName?: string };

export function UsersPage() {
  const [userRefreshKey, setUserRefreshKey] = useState(0);

  const licenseList = useFilteredList<LicenseAdminRow>("/api/v1/admin/licenses", {
    verifyStatus: "PENDING",
    phone: ""
  });

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("证件不清晰，请重新拍摄上传");
  const [actionMsg, setActionMsg] = useState("");

  const handleApprove = async (id: string) => {
    const res = await api.put<UserLicenseRecord>(`/api/v1/admin/licenses/${id}/approve`, {});
    if (res.ok) {
      setActionMsg("已通过审核");
      licenseList.search();
      setUserRefreshKey((k) => k + 1);
    } else setActionMsg(res.error ?? "操作失败");
  };

  const handleReject = async (id: string) => {
    const res = await api.put<UserLicenseRecord>(`/api/v1/admin/licenses/${id}/reject`, {
      rejectReason
    });
    if (res.ok) {
      setActionMsg("已驳回");
      setRejectId(null);
      licenseList.search();
      setUserRefreshKey((k) => k + 1);
    } else setActionMsg(res.error ?? "操作失败");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">用户与认证</h2>
        <p className="text-sm text-muted-foreground">
          FR-USER-012~014 · 实名/驾照/用车资格 · 仅自驾校验驾照（3003/3004/3005）
        </p>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="font-medium">{SERVICE_MODE_META.SELF_DRIVE.title}</p>
          <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
            {SERVICE_MODE_META.SELF_DRIVE.bullets.slice(0, 3).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="font-medium">{SERVICE_MODE_META.WITH_DRIVER.title}</p>
          <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
            {SERVICE_MODE_META.WITH_DRIVER.bullets.slice(0, 3).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
          <p className="font-medium">{SERVICE_MODE_META.MIXED.title}</p>
          <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
            {SERVICE_MODE_META.MIXED.bullets.slice(0, 3).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      <CollapsibleSection
        title="驾照审核队列"
        description="PUT /api/v1/admin/licenses/{id}/approve|reject"
        defaultOpen
        badge={
          <Badge variant="warning">
            {licenseList.items.filter((l) => l.verifyStatus === "PENDING").length} 待审
          </Badge>
        }
      >
        <div className="space-y-4">
          <ListFilterForm
            fields={licenseFilterFields}
            values={licenseList.filters}
            onChange={licenseList.setFilter}
            onSearch={licenseList.search}
            onReset={licenseList.reset}
            loading={licenseList.loading}
          />
          {actionMsg && <p className="text-sm text-primary">{actionMsg}</p>}
          <DataTable
            rows={licenseList.items}
            emptyText={licenseList.loading ? "加载中…" : "无待审驾照"}
            columns={[
              {
                key: "user",
                header: "用户",
                render: (r) => (
                  <div>
                    <p>{r.userRealName}</p>
                    <p className="text-xs text-muted-foreground">{r.userPhone}</p>
                  </div>
                )
              },
              { key: "class", header: "准驾", render: (r) => r.licenseClass },
              {
                key: "role",
                header: "类型",
                render: (r) =>
                  licenseRoleLabel[
                    r.role ?? (r.vehicleId ? "SELF_DRIVE_DRIVER" : "ACCOUNT_HOLDER")
                  ]
              },
              {
                key: "driver",
                header: "驾驶人",
                render: (r) => r.driverName ?? "—"
              },
              {
                key: "vehicle",
                header: "绑定车辆",
                render: (r) => r.plateNumber ?? (r.vehicleId ? "已绑定" : "—")
              },
              { key: "exp", header: "有效期", render: (r) => r.expiryDate },
              {
                key: "status",
                header: "状态",
                render: (r) => (
                  <Badge variant={r.verifyStatus === "PENDING" ? "warning" : "outline"}>
                    {licenseVerifyStatusLabel[r.verifyStatus]}
                  </Badge>
                )
              },
              {
                key: "act",
                header: "操作",
                render: (r) =>
                  r.verifyStatus === "PENDING" ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
                        onClick={() => void handleApprove(r.id)}
                      >
                        通过
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-border px-2 py-1 text-xs"
                        onClick={() => setRejectId(r.id)}
                      >
                        驳回
                      </button>
                    </div>
                  ) : (
                    "—"
                  )
              }
            ]}
          />
          {rejectId && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-medium">驳回原因</p>
              <input
                className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-md bg-destructive px-3 py-1.5 text-xs text-destructive-foreground"
                  onClick={() => void handleReject(rejectId)}
                >
                  确认驳回
                </button>
                <button type="button" className="rounded-md border px-3 py-1.5 text-xs" onClick={() => setRejectId(null)}>
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="用户列表" description="CRUD /api/v1/admin/users" defaultOpen>
        <AdminCrudPanel<User>
          key={userRefreshKey}
          resource="users"
          listPath="/api/v1/admin/users"
          initialFilters={{
            phone: "",
            realNameStatus: "",
            licenseStatus: "",
            licenseVerifyStatus: "",
            status: ""
          }}
          filterFields={userFilterFields}
          formFields={userCrudFields}
          batchActions={userBatchActions}
          columns={[
            { key: "phone", header: "手机号", render: (r) => r.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") },
            { key: "name", header: "姓名", render: (r) => r.realName },
            {
              key: "real",
              header: "实名",
              render: (r) => (
                <Badge variant={r.realNameStatus === "APPROVED" ? "success" : "warning"}>{r.realNameStatus}</Badge>
              )
            },
            { key: "license", header: "驾照审核", render: (r) => r.licenseVerifyStatus ?? "—" },
            { key: "status", header: "账户", render: (r) => r.status }
          ]}
        />
      </CollapsibleSection>
    </div>
  );
}
