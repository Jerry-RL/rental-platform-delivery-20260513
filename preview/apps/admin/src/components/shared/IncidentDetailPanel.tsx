import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  formatMoney,
  orderStatusLabel,
  serviceModeLabel,
  ticketStatusLabel,
  vehicleStatusLabel,
  type IncidentDetail
} from "@rental-preview/shared";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const fmt = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
};

type IncidentDetailPanelProps = {
  detail: IncidentDetail;
  onRefresh?: () => void;
};

export const IncidentDetailPanel = ({ detail, onRefresh }: IncidentDetailPanelProps) => {
  const { incident, order, vehicle, user, relatedTickets, relations } = detail;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="warning">{incident.statusLabel}</Badge>
        <Badge variant="outline">{incident.serviceContextLabel}</Badge>
        <Badge variant="secondary">{incident.responsiblePartyLabel}</Badge>
        {incident.pauseBilling && <Badge variant="warning">暂停计费</Badge>}
        {incident.vehicleHold && <Badge variant="outline">车辆停运</Badge>}
        {onRefresh && (
          <Button type="button" size="sm" variant="outline" onClick={onRefresh}>
            刷新
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">事故信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="事故单号" value={incident.id} />
            <Row label="类型" value={incident.incidentType} />
            <Row label="事故时间" value={fmt(incident.incidentAt)} />
            <Row label="上报时间" value={fmt(incident.reportedAt)} />
            <Row label="地点" value={incident.location} />
            <Row label="联系电话" value={incident.reporterPhone ?? "—"} />
            <Row label="保险" value={incident.insuranceStatusLabel ?? "—"} />
            <Row label="交警报案号" value={incident.policeReportNo || "—"} />
            <Row label="人伤" value={incident.hasInjury ? "是" : "否"} />
            <Row
              label="预估费用"
              value={incident.estimatedCost > 0 ? formatMoney(incident.estimatedCost) : "—"}
            />
            {incident.description && (
              <p className="rounded-md bg-muted/40 p-2 text-xs leading-relaxed text-muted-foreground">
                {incident.description}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">关联对象</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order && (
              <div>
                <Row label="订单" value={order.orderNo} />
                <Row label="状态" value={orderStatusLabel[order.status]} />
                <Row label="服务" value={serviceModeLabel[order.serviceMode]} />
                <Row
                  label="租期"
                  value={`${fmt(order.pickupTime)} → ${fmt(order.returnTime)}`}
                />
                {order.incidentPending && (
                  <p className="text-xs text-warning">订单 incident_pending</p>
                )}
                <Link to={relations.orderHref} className="text-xs text-primary hover:underline">
                  订单详情 →
                </Link>
              </div>
            )}
            {vehicle && (
              <div className="border-t border-border pt-2">
                <Row label="车辆" value={`${vehicle.plateNumber} ${vehicle.brand} ${vehicle.model}`} />
                <Row label="车况" value={vehicleStatusLabel[vehicle.status]} />
                {relations.vehicleHref && (
                  <Link to={relations.vehicleHref} className="text-xs text-primary hover:underline">
                    车辆轨迹 →
                  </Link>
                )}
              </div>
            )}
            {user && relations.userHref && (
              <div className="border-t border-border pt-2">
                <Row label="用户" value={`${user.realName} ${user.phone}`} />
                <Link to={relations.userHref} className="text-xs text-primary hover:underline">
                  用户档案 →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {relatedTickets.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">关联工单</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {relatedTickets.map((t) => (
              <div key={t.id} className="rounded-md border border-border p-2 text-sm">
                <p className="font-medium">{t.ticketNo}</p>
                <p className="text-xs text-muted-foreground">{t.subject}</p>
                <p className="text-xs">
                  {ticketStatusLabel[t.status]} · {t.priority} · {fmt(t.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right">{value}</span>
  </div>
);
