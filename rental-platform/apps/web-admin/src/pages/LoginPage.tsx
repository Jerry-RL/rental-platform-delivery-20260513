import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAdminFlowContext } from "../context/AdminFlowContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { message, core } = useAdminFlowContext();

  useEffect(() => {
    if (core.token) {
      navigate("/core", { replace: true });
    }
  }, [core.token, navigate]);

  const handleLogin = async () => {
    const ok = await core.handleLogin();
    if (ok) {
      navigate("/core", { replace: true });
    }
  };

  return (
    <AuthLayout title="管理端登录" description="使用联调账号登录后进入运营管理台">
      <Card>
        <CardHeader>
          <CardTitle>管理员账号</CardTitle>
          <CardDescription>登录后可操作订单、违章、配额等模块。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={core.phone} onChange={(e) => core.setPhone(e.target.value)} placeholder="手机号" />
          <Input value={core.password} type="password" onChange={(e) => core.setPassword(e.target.value)} placeholder="密码" />
          <Button className="w-full" onClick={handleLogin} type="button">
            登录
          </Button>
          {message ? <p className="text-center text-sm text-primary">{message}</p> : null}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
