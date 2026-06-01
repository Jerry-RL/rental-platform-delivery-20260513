import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, setPreviewToken, type TokenData } from "@rental-preview/shared";
import { cn } from "../lib/utils";

const demoAccounts = [
  { label: "C端·已注册", phone: "13800138000", hint: "须先注册；演示种子已注册" },
  { label: "B端·已认证", phone: "13900139000", hint: "企业开通，直接登录" },
  { label: "G端·已认证", phone: "13700137000", hint: "政务开通，直接登录" },
  { label: "B端·成员待认证", phone: "13600136000", hint: "企业成员待审批" },
  { label: "驾照已过期", phone: "13600136098", hint: "C端已注册 · 错误码 3003" },
  { label: "未上传驾照", phone: "13600136097", hint: "C端已注册 · 引导 /license" },
  { label: "驾照已驳回", phone: "13600136096", hint: "C端已注册 · 可重新提交" }
];

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const phoneFromQuery = params.get("phone") ?? "";
  const [phone, setPhone] = useState(phoneFromQuery || "13800138000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (p: string) => {
    setLoading(true);
    setError(null);
    const res = await api.post<TokenData>("/api/v1/users/login", { phone: p.trim(), password: "demo" });
    setLoading(false);
    if (res.ok && res.data) {
      setPreviewToken(res.data.accessToken);
      navigate("/home", { replace: true });
      return;
    }
    setError(res.error ?? res.raw?.message ?? "登录失败");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-phone flex-col justify-center bg-background p-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-2xl text-primary">
          租
        </div>
        <h1 className="text-2xl font-bold">智慧租车 H5</h1>
        <p className="mt-1 text-sm text-muted-foreground">C 端须注册后登录 · B/G 由企业开通</p>
      </div>

      <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
        <p>
          <strong className="text-foreground">C 端个人</strong>：请先{" "}
          <Link to="/register" className="font-medium text-primary">
            注册
          </Link>
          ，再使用手机号登录。
        </p>
        <p className="mt-1">
          <strong className="text-foreground">B/G 端</strong>：使用企业分配账号登录，无需注册。
        </p>
      </div>

      <label className="mb-4 block text-sm">
        手机号
        <input
          className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      {error && (
        <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {error}
          {error.includes("未注册") && (
            <Link to="/register" className="ml-2 font-medium underline">
              去注册
            </Link>
          )}
        </p>
      )}

      <button
        type="button"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground disabled:opacity-60"
        onClick={() => void handleLogin(phone)}
      >
        {loading ? "登录中…" : "登录"}
      </button>

      <p className="mt-4 text-center text-sm">
        没有账号？
        <Link to="/register" className="ml-1 font-medium text-primary">
          立即注册
        </Link>
      </p>

      <p className="mb-2 mt-8 text-xs text-muted-foreground">演示快捷登录（种子账号）</p>
      <div className="flex flex-col gap-2">
        {demoAccounts.map((a) => (
          <button
            key={a.phone}
            type="button"
            className={cn(
              "rounded-xl border border-border bg-card px-4 py-3 text-left text-sm",
              phone === a.phone && "border-primary/40 bg-primary/5"
            )}
            onClick={() => {
              setPhone(a.phone);
              void handleLogin(a.phone);
            }}
          >
            <span className="font-medium">{a.label}</span>
            <span className="ml-2 text-muted-foreground">{a.phone}</span>
            {a.hint ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">{a.hint}</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
