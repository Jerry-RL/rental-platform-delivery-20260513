import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  api,
  formatMoney,
  orderStatusLabel,
  RENTAL_COMPANY_CONTACT,
  serviceModeLabel,
  ticketStatusLabel,
  vehicleStatusLabel,
  type IncidentDetail
} from "@rental-preview/shared";
import { DetailLine } from "../components/DetailLine";
import { SectionCard } from "../components/SectionCard";
import { cn } from "../lib/utils";

const fmt = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
};

export function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await api.get<IncidentDetail>(`/api/v1/incidents/${id}`);
    setDetail(res.ok ? res.data : null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <p className="p-4 text-sm text-muted-foreground">加载中…</p>;
  if (!detail) {
    return (
      <div className="space-y-4 p-4">
        <button type="button" className="text-sm text-primary" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <p className="text-sm text-muted-foreground">事故记录不存在</p>
      </div>
    );
  }

  const { incident, order, vehicle, relatedTickets } = detail;
  const companyTel = RENTAL_COMPANY_CONTACT.servicePhone.replace(/-/g, "");

  return (
    <div className="space-y-4 p-4 pb-8">
      <button type="button" className="text-sm text-primary" onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <div>
        <h1 className="text-lg font-bold">事故详情</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {incident.incidentType} · {incident.statusLabel}
        </p>
      </div>

      <div
        className={cn(
          "rounded-xl border px-3 py-2 text-xs",
          incident.status === "RESOLVED" || incident.status === "CLOSED"
            ? "border-success/30 bg-success/5"
            : "border-warning/30 bg-warning/5"
        )}
      >
        <p className="font-medium">{incident.statusLabel}</p>
        {incident.pauseBilling && (
          <p className="mt-1 text-warning">已申请暂停计费（FR-ORD-010）</p>
        )}
        {incident.vehicleHold && (
          <p className="mt-0.5 text-muted-foreground">车辆已申请停运检修（BR-030）</p>
        )}
      </div>

      <SectionCard title="事故信息">
        <DetailLine label="事故时间" value={fmt(incident.incidentAt)} />
        <DetailLine label="上报时间" value={fmt(incident.reportedAt)} />
        <DetailLine label="地点" value={incident.location} />
        <DetailLine label="类型" value={incident.incidentType} />
        <DetailLine label="场景" value={incident.serviceContextLabel} />
        <DetailLine label="责任" value={incident.responsiblePartyLabel} />
        <DetailLine label="联系电话" value={incident.reporterPhone ?? "—"} />
        {incident.policeReportNo && (
          <DetailLine label="报案号" value={incident.policeReportNo} />
        )}
        {incident.insuranceStatusLabel && (
          <DetailLine label="保险理赔" value={incident.insuranceStatusLabel} />
        )}
        {incident.hasInjury && (
          <p className="text-xs text-destructive">涉及人伤，已创建高优先级工单</p>
        )}
        {incident.description && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{incident.description}</p>
        )}
        {incident.estimatedCost > 0 && (
          <DetailLine label="预估费用" value={formatMoney(incident.estimatedCost)} />
        )}
      </SectionCard>

      {order && (
        <SectionCard title="关联订单">
          <DetailLine label="订单号" value={order.orderNo} />
          <DetailLine label="订单状态" value={orderStatusLabel[order.status]} />
          <DetailLine label="服务方式" value={serviceModeLabel[order.serviceMode]} />
          <DetailLine label="租期" value={`${fmt(order.pickupTime)} → ${fmt(order.returnTime)}`} />
          {order.incidentPending && (
            <p className="text-xs text-warning">订单待结事故费（BR-031）</p>
          )}
          <Link to={detail.relations.orderHref} className="mt-2 inline-block text-sm text-primary">
            查看订单 →
          </Link>
        </SectionCard>
      )}

      {vehicle && (
        <SectionCard title="车辆">
          <DetailLine
            label="车牌"
            value={`${vehicle.plateNumber} · ${vehicle.brand} ${vehicle.model}`}
          />
          <DetailLine label="车辆状态" value={vehicleStatusLabel[vehicle.status]} />
          {detail.relations.vehicleHref && (
            <Link to={detail.relations.vehicleHref} className="mt-2 inline-block text-sm text-primary">
              查看车辆 →
            </Link>
          )}
        </SectionCard>
      )}

      {relatedTickets.length > 0 && (
        <SectionCard title="关联工单">
          <ul className="space-y-2 text-sm">
            {relatedTickets.map((t) => (
              <li key={t.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="font-medium">{t.ticketNo}</p>
                <p className="text-xs text-muted-foreground">{t.subject}</p>
                <p className="mt-1 text-xs">{ticketStatusLabel[t.status]} · {t.priority}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
        <p className="text-muted-foreground">如有疑问请联系租车公司</p>
        <a href={`tel:${companyTel}`} className="text-base font-semibold text-primary">
          {RENTAL_COMPANY_CONTACT.servicePhone}
        </a>
      </div>
    </div>
  );
}
