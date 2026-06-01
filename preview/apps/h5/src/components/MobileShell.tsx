import { Outlet } from "react-router-dom";
import { useAccountContext } from "../hooks/useAccountContext";
import { TabBar } from "./TabBar";

export function MobileShell() {
  const { account } = useAccountContext();

  return (
    <div className="mx-auto min-h-screen max-w-phone bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card px-4 py-3">
        <p className="text-[11px] text-muted-foreground">
          方案预览 · {account?.segmentLabel ?? "未登录"}
          {account?.requiresOrgAuth && !account.accountAuthOk ? " · 待认证" : ""}
        </p>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">智慧租车</h1>
      </header>
      <Outlet />
      <TabBar />
    </div>
  );
}
