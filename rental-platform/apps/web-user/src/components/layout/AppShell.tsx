import { Outlet, useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { USE_MOCK_MODE } from "../../config/runtime";
import { useFlowContext } from "../../context/FlowContext";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";

export function AppShell() {
  const navigate = useNavigate();
  const { message, booking } = useFlowContext();

  const handleLogout = () => {
    booking.handleLogout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b border-border bg-card/50 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
          <div className="space-y-1">
            <Badge variant="secondary">Web User</Badge>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">租车平台 · 用户端</h1>
            <p className="text-xs text-muted-foreground md:text-sm">查车下单 → 账单支付 → 扩展服务</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={USE_MOCK_MODE ? "warning" : "secondary"}>{USE_MOCK_MODE ? "Mock" : "Real"}</Badge>
            <Badge variant="success">已登录</Badge>
            <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
              退出
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        <StatusBar message={message} />
      </div>
    </div>
  );
}
