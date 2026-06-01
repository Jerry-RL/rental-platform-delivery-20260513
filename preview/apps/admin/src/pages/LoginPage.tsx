import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setPreviewToken } from "@rental-preview/shared";
import type { TokenData } from "@rental-preview/shared";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("13800001001");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await api.post<TokenData>("/api/v1/users/login", { phone, password: "preview" });
    setLoading(false);
    if (!res.ok || !res.data) {
      setError(res.error ?? "登录失败");
      return;
    }
    setPreviewToken(res.data.accessToken);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge variant="warning" className="mb-2 w-fit">
            方案演示
          </Badge>
          <CardTitle>管理端登录</CardTitle>
          <p className="text-sm text-muted-foreground">
            密码任意 · 须为种子用户或员工手机号（POST /api/v1/users/login）
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-sm">
            <span className="text-muted-foreground">工号手机（演示）</span>
            <input
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="13800001001"
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="button" className="w-full" disabled={loading} onClick={() => void handleLogin()}>
            {loading ? "登录中…" : "进入管理后台"}
          </Button>
          <p className="text-xs text-muted-foreground">
            员工：13800001001 / 13800001002 / 13800001004 · C 端联调：13800138000
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
