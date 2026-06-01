import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  api,
  formatMoney,
  getPreviewUserId,
  orgMemberStatusLabel,
  orgStatusLabel,
  licenseStatusLabel,
  licenseVerifyStatusLabel,
  pickRecentReorderableOrders,
  serviceModeLabel,
  setPreviewToken,
  type Order,
  type PageResult
} from "@rental-preview/shared";
import { AccountAuthBanner } from "../components/AccountAuthBanner";
import { OrgAuthContactSection } from "../components/OrgAuthContactSection";
import { useAccountContext } from "../hooks/useAccountContext";
import { useReorder } from "../hooks/useReorder";

export function MePage() {
  const navigate = useNavigate();
  const userId = getPreviewUserId();
  const { user, account, refresh } = useAccountContext();
  const { reorder, reordering } = useReorder();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!userId) return;
    void api
      .get<PageResult<Order>>(`/api/v1/orders?userId=${userId}&pageSize=15`)
      .then((res) => {
        if (res.ok && res.data) {
          setRecentOrders(pickRecentReorderableOrders(res.data.items, 3));
        }
      });
  }, [userId]);

  const handleLogout = () => {
    setPreviewToken(null);
    navigate("/login", { replace: true });
  };

  const licenseVerifyLabel = user?.licenseVerifyStatus
    ? licenseVerifyStatusLabel[user.licenseVerifyStatus]
    : "未认证";
  const licenseValidLabel = user?.licenseStatus ? licenseStatusLabel[user.licenseStatus] : "—";

  const menuItems = [
    {
      title: "实名认证",
      desc: `状态：${user?.realNameStatus ?? "NONE"}`,
      fr: "FR-USER-012",
      path: "/realname",
      show: user?.realNameStatus !== "APPROVED"
    },
    {
      title: "本人驾照认证",
      desc:
        user?.licenseExpiryDate && user.licenseStatus === "VALID"
          ? `${user.licenseType ?? "—"} · 有效期至 ${user.licenseExpiryDate}`
          : `${licenseVerifyLabel} · ${licenseValidLabel}`,
      fr: "FR-USER-013",
      path: "/license",
      show: true
    },
    {
      title: "开票抬头",
      desc: "多抬头库 · 税号校验",
      fr: "FR-USER-018",
      path: null,
      show: true
    },
    {
      title: "我的违章",
      desc: "租期关联 · 罚款与代办费",
      fr: "FR-EXT-001",
      path: "/violations",
      show: true
    },
    {
      title: "我的事故",
      desc: "租期上报 · 暂停计费",
      fr: "FR-ORD-008",
      path: "/incidents",
      show: true
    },
    {
      title: "客服工单",
      desc: "投诉与赔付记录",
      fr: "FR-CS-001",
      path: null,
      show: true
    }
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="card-surface p-4">
        <p className="text-lg font-bold">{user?.realName ?? "游客"}</p>
        <p className="text-sm text-muted-foreground">{user?.phone}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {account && (
            <span
              className={
                account.segment === "C"
                  ? "rounded-full bg-muted px-2 py-1 text-muted-foreground"
                  : "rounded-full bg-primary/15 px-2 py-1 text-primary"
              }
            >
              {account.segmentLabel}
            </span>
          )}
          <span className="rounded-full bg-success/15 px-2 py-1 text-success">
            实名 {user?.realNameStatus}
          </span>
          <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">
            驾照 {licenseVerifyLabel}
          </span>
          {user?.licenseStatus === "EXPIRED" && (
            <span className="rounded-full bg-destructive/15 px-2 py-1 text-destructive">已过期</span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {account?.requiresOrgAuth
            ? "B/G 端：企业资质与成员账号认证通过后方可使用租车服务；自驾另须驾照，包车无需客户驾照。"
            : "C 端：单台自驾可用本人驾照；多台自驾须在下单页登记本次自驾司机驾照；包车仅需实名。"}
        </p>
      </div>

      {account && <AccountAuthBanner account={account} />}

      {account?.requiresOrgAuth && account.org && account.member && (
        <section className="card-surface space-y-2 p-4 text-sm">
          <p className="font-medium">企业账号认证</p>
          <p className="text-xs text-muted-foreground">{account.org.orgName}</p>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">企业状态</span>
            <span>{orgStatusLabel[account.org.status]}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">成员状态</span>
            <span>{orgMemberStatusLabel[account.member.status]}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">部门</span>
            <span>{account.member.departmentName}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            授信 {formatMoney(account.org.creditLimit)} · 已用{" "}
            {formatMoney(account.org.usedAmount)}
          </p>
          <OrgAuthContactSection
            account={account}
            loginPhone={user?.phone}
            onSaved={() => void refresh()}
          />
        </section>
      )}

      {recentOrders.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium">再次下单</p>
            <button
              type="button"
              className="text-xs text-primary"
              onClick={() => navigate("/orders")}
            >
              更多 ›
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{o.plateNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {serviceModeLabel[o.serviceMode]} · {formatMoney(o.totalFee)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={reordering}
                  className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
                  onClick={() => void reorder(o)}
                >
                  再次下单
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="divide-y divide-border rounded-xl border border-border bg-card text-sm">
        {menuItems
          .filter((m) => m.show)
          .map((item) => (
            <button
              key={item.title}
              type="button"
              className="flex w-full justify-between px-4 py-3 text-left"
              onClick={() => item.path && navigate(item.path)}
              disabled={!item.path}
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.desc} · {item.fr}
                </p>
              </div>
              <span className="text-muted-foreground">{item.path ? "›" : "—"}</span>
            </button>
          ))}
      </section>

      <button
        type="button"
        className="w-full rounded-xl border border-border py-3 text-sm"
        onClick={handleLogout}
      >
        退出登录
      </button>
    </div>
  );
}
