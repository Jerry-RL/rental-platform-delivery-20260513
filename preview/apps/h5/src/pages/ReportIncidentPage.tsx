import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  api,
  RENTAL_COMPANY_CONTACT,
  type CreateIncidentReportRequest,
  type IncidentReportGateResult,
  type OrderDetail
} from "@rental-preview/shared";

const INCIDENT_TYPES = ["刮蹭", "碰撞", "盗抢", "其他"];

export function ReportIncidentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail["order"] | null>(null);
  const [gate, setGate] = useState<IncidentReportGateResult | null>(null);
  const [form, setForm] = useState({
    incidentAt: new Date().toISOString().slice(0, 16),
    location: "",
    incidentType: "刮蹭",
    reporterPhone: "",
    description: "",
    hasInjury: false,
    policeReportNo: "",
    vehicleHold: true,
    pauseBilling: true
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    const [oRes, gRes] = await Promise.all([
      api.get<OrderDetail>(`/api/v1/orders/${orderId}`),
      api.get<IncidentReportGateResult>(`/api/v1/orders/${orderId}/incident-gate`)
    ]);
    if (oRes.ok && oRes.data) setOrder(oRes.data.order);
    if (gRes.ok && gRes.data) setGate(gRes.data);
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async () => {
    if (!orderId || !gate?.allowed) return;
    setMsg("");
    setLoading(true);
    const payload: CreateIncidentReportRequest = {
      orderId,
      incidentAt: new Date(form.incidentAt).toISOString(),
      location: form.location.trim(),
      incidentType: form.incidentType,
      reporterPhone: form.reporterPhone.trim(),
      description: form.description.trim() || undefined,
      hasInjury: form.hasInjury,
      policeReportNo: form.policeReportNo.trim() || undefined,
      vehicleHold: form.vehicleHold,
      pauseBilling: form.pauseBilling
    };
    const res = await api.post<{ incident: { id: string } }>(
      `/api/v1/orders/${orderId}/incidents`,
      payload
    );
    setLoading(false);
    if (!res.ok) {
      setMsg(res.error ?? "上报失败");
      return;
    }
    navigate(`/orders/${orderId}`, { replace: true });
  };

  if (!orderId) {
    return <p className="p-4 text-sm text-muted-foreground">缺少订单 ID</p>;
  }

  return (
    <div className="space-y-4 p-4 pb-8">
      <button type="button" className="text-sm text-primary" onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <div>
        <h1 className="text-lg font-bold">上报租期事故</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          FR-ORD-008 · 自驾用车发生事故须及时上报 · 订单 {order?.orderNo ?? orderId}
        </p>
      </div>

      {gate && !gate.allowed && (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          {gate.message}
        </p>
      )}

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
        <p className="text-muted-foreground">紧急协助请致电租车公司</p>
        <a
          href={`tel:${RENTAL_COMPANY_CONTACT.servicePhone.replace(/-/g, "")}`}
          className="text-base font-semibold text-primary"
        >
          {RENTAL_COMPANY_CONTACT.servicePhone}
        </a>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <label className="block text-xs">
          <span className="font-medium">事故时间</span>
          <input
            type="datetime-local"
            required
            value={form.incidentAt}
            onChange={(e) => setForm((f) => ({ ...f, incidentAt: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs">
          <span className="font-medium">事故地点</span>
          <input
            required
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="详细地址"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs">
          <span className="font-medium">事故类型</span>
          <select
            value={form.incidentType}
            onChange={(e) => setForm((f) => ({ ...f, incidentType: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs">
          <span className="font-medium">联系电话</span>
          <input
            type="tel"
            required
            maxLength={11}
            value={form.reporterPhone}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                reporterPhone: e.target.value.replace(/\D/g, "").slice(0, 11)
              }))
            }
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs">
          <span className="font-medium">情况说明</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="请描述事故经过"
          />
        </label>
        <label className="block text-xs">
          <span className="font-medium">交警报案号（选填）</span>
          <input
            value={form.policeReportNo}
            onChange={(e) => setForm((f) => ({ ...f, policeReportNo: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.hasInjury}
            onChange={(e) => setForm((f) => ({ ...f, hasInjury: e.target.checked }))}
          />
          涉及人伤（将创建高优先级工单，BR-033）
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.pauseBilling}
            onChange={(e) => setForm((f) => ({ ...f, pauseBilling: e.target.checked }))}
          />
          申请暂停计费（FR-ORD-010）
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.vehicleHold}
            onChange={(e) => setForm((f) => ({ ...f, vehicleHold: e.target.checked }))}
          />
          车辆停运待检修（BR-030 · ACCIDENT_HOLD）
        </label>

        {msg && <p className="text-xs text-destructive">{msg}</p>}

        <button
          type="submit"
          disabled={loading || !gate?.allowed || form.reporterPhone.length < 11}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "提交中…" : "提交事故上报"}
        </button>
      </form>
    </div>
  );
}
