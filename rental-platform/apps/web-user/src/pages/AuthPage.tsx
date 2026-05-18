import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { useFlowContext } from "../context/FlowContext";
import { AuthPanel } from "../features/panels/AuthPanel";

export function AuthPage() {
  const navigate = useNavigate();
  const { message, booking } = useFlowContext();

  useEffect(() => {
    if (booking.token) {
      navigate("/booking", { replace: true });
    }
  }, [booking.token, navigate]);

  const handleLogin = async () => {
    const ok = await booking.handleLogin();
    if (ok) {
      navigate("/booking", { replace: true });
    }
  };

  return (
    <AuthLayout title="租车平台" description="注册新账号或登录已有账户，进入后开始租车流程">
      <AuthPanel
        phone={booking.phone}
        password={booking.password}
        onPhoneChange={booking.setPhone}
        onPasswordChange={booking.setPassword}
        onRegister={booking.handleRegister}
        onLogin={handleLogin}
      />
      {message ? <p className="mt-4 text-center text-sm text-primary">{message}</p> : null}
    </AuthLayout>
  );
}
