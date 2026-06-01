import { Outlet, useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { setPreviewToken } from "@rental-preview/shared";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const navigate = useNavigate();

  const handleLogout = () => {
    setPreviewToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-4 md:px-6">
          <div>
            <h1 className="text-xl font-bold">租车平台 · 管理端预览</h1>
            <p className="text-xs text-muted-foreground">接口路径与字段对齐 OpenAPI v1.5 · 纯前端 Mock</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">Preview</Badge>
            <Badge variant="success">Mock API</Badge>
            <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
              退出
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
