import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type User } from "@rental-preview/shared";

export function RegisterPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("123456");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!agreed) {
      setError("请先阅读并同意用户服务协议");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await api.post<User>("/api/v1/users/register", {
      phone,
      password: "demo",
      verifyCode
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(res.raw?.message ?? "注册成功，请登录");
      setTimeout(() => {
        navigate(`/login?phone=${encodeURIComponent(phone.trim())}`, { replace: true });
      }, 800);
      return;
    }
    setError(res.error ?? res.raw?.message ?? "注册失败");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-phone flex-col justify-center bg-background p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">注册 C 端账号</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          个人用户须先注册再登录；B/G 企业账号由管理员开通，无需在此注册。
        </p>
      </div>

      <label className="mb-3 block text-sm">
        手机号
        <input
          type="tel"
          inputMode="numeric"
          maxLength={11}
          className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-3"
          placeholder="11 位手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
        />
      </label>

      <label className="mb-3 block text-sm">
        短信验证码
        <div className="mt-1 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3"
            placeholder="演示可填 123456"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
          />
          <button
            type="button"
            className="shrink-0 rounded-xl border border-border px-3 text-xs text-muted-foreground"
            onClick={() => setVerifyCode("123456")}
          >
            演示验证码
          </button>
        </div>
      </label>

      <label className="mb-4 flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>我已阅读并同意《用户服务协议》与《隐私政策》（演示勾选即可）</span>
      </label>

      {error && (
        <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-center text-sm text-primary">
          {success}
        </p>
      )}

      <button
        type="button"
        disabled={loading || phone.length < 11}
        className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground disabled:opacity-50"
        onClick={() => void handleRegister()}
      >
        {loading ? "注册中…" : "注册"}
      </button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        已有账号？
        <Link to="/login" className="ml-1 font-medium text-primary">
          去登录
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        B/G 企业用户请使用企业开通手机号直接{" "}
        <Link to="/login" className="text-primary">
          登录
        </Link>
      </p>
    </div>
  );
}
