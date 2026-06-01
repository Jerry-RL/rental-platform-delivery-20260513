import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getPreviewUserId, type SubmitRealnameRequest, type User } from "@rental-preview/shared";
import { SectionCard } from "../components/SectionCard";

export function RealnamePage() {
  const navigate = useNavigate();
  const userId = getPreviewUserId();
  const [form, setForm] = useState<SubmitRealnameRequest>({
    realName: "",
    idCardNo: "",
    idCardFrontUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600",
    idCardBackUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600"
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId || !form.realName.trim() || !form.idCardNo.trim()) {
      setMsg("请填写姓名与身份证号");
      return;
    }
    setLoading(true);
    const res = await api.post<User>(`/api/v1/users/${userId}/realname`, form);
    setLoading(false);
    if (!res.ok) {
      setMsg(res.error ?? "提交失败");
      return;
    }
    setMsg("实名已提交，审核通过后可继续驾照认证");
    setTimeout(() => navigate("/license"), 800);
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      <button type="button" className="text-sm text-primary" onClick={() => navigate(-1)}>
        ← 返回
      </button>
      <div>
        <h2 className="text-lg font-bold">实名认证</h2>
        <p className="text-xs text-muted-foreground">FR-USER-012 · 驾照认证前置条件（错误码 3004）</p>
      </div>
      <SectionCard title="身份信息" description="演示环境不调用真实公安/人脸接口">
        <label className="block text-xs text-muted-foreground">
          真实姓名
          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.realName}
            onChange={(e) => setForm((f) => ({ ...f, realName: e.target.value }))}
          />
        </label>
        <label className="block text-xs text-muted-foreground">
          身份证号
          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={form.idCardNo}
            onChange={(e) => setForm((f) => ({ ...f, idCardNo: e.target.value }))}
            placeholder="18 位"
          />
        </label>
        <button
          type="button"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          onClick={() => void handleSubmit()}
        >
          {loading ? "提交中…" : "提交实名认证"}
        </button>
      </SectionCard>
      {msg && <p className="text-center text-sm text-primary">{msg}</p>}
    </div>
  );
}
