import { Link } from "react-router-dom";
import {
  orgMemberStatusLabel,
  orgStatusLabel,
  type AccountContext
} from "@rental-preview/shared";
import { cn } from "../lib/utils";

type AccountAuthBannerProps = {
  account: AccountContext;
  className?: string;
};

export const AccountAuthBanner = ({ account, className }: AccountAuthBannerProps) => {
  if (!account.requiresOrgAuth) return null;

  const tone = account.accountAuthOk ? "ok" : "warn";

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "ok"
          ? "border-primary/25 bg-primary/5"
          : "border-warning/40 bg-warning/10",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            account.segment === "B"
              ? "bg-primary/15 text-primary"
              : "bg-accent text-accent-foreground"
          )}
        >
          {account.segmentLabel}
        </span>
        {account.org && (
          <span className="text-xs text-muted-foreground truncate max-w-[12rem]">
            {account.org.orgName}
          </span>
        )}
        {account.accountAuthOk ? (
          <span className="text-xs text-primary">账号已认证</span>
        ) : (
          <span className="text-xs font-medium text-warning">账号未认证</span>
        )}
      </div>

      {account.org && account.member && (
        <p className="mt-2 text-xs text-muted-foreground">
          企业 {orgStatusLabel[account.org.status]} · 成员{" "}
          {orgMemberStatusLabel[account.member.status]}
          {account.member.departmentName ? ` · ${account.member.departmentName}` : ""}
        </p>
      )}

      <p className={cn("mt-1.5 text-xs leading-relaxed", tone === "warn" && "text-warning")}>
        {account.message}
      </p>

      {!account.accountAuthOk && (
        <p className="mt-2 text-xs text-muted-foreground">
          B/G 端用户须企业资质与成员账号均通过认证后方可选车下单；认证由管理端审批。
          <Link to="/me" className="ml-1 text-primary underline-offset-2">
            查看我的认证
          </Link>
        </p>
      )}
    </div>
  );
};
