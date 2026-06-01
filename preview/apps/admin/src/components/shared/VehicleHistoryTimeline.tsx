import { Link } from "react-router-dom";
import type { VehicleHistoryEvent, VehicleHistoryEventType, VehicleHistoryTimeline } from "@rental-preview/shared";
import { formatMoney, vehicleHistoryEventTypeLabel } from "@rental-preview/shared";
import {
  Car,
  ClipboardCheck,
  FileText,
  Shield,
  ShoppingCart,
  Wrench
} from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const typeStyles: Record<
  VehicleHistoryEventType,
  { border: string; dot: string; icon: typeof Car }
> = {
  PURCHASE: { border: "border-l-primary", dot: "bg-primary", icon: ShoppingCart },
  MAINTENANCE: { border: "border-l-success", dot: "bg-success", icon: Wrench },
  INSURANCE: { border: "border-l-sky-500", dot: "bg-sky-500", icon: Shield },
  REPAIR: { border: "border-l-destructive", dot: "bg-destructive", icon: Wrench },
  ORDER: { border: "border-l-warning", dot: "bg-warning", icon: FileText },
  ANNUAL_REVIEW: { border: "border-l-muted-foreground", dot: "bg-muted-foreground", icon: ClipboardCheck }
};

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

type VehicleHistoryTimelineProps = {
  timeline: VehicleHistoryTimeline | null;
  loading?: boolean;
};

export function VehicleHistoryTimelineView({ timeline, loading }: VehicleHistoryTimelineProps) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">加载轨迹…</p>;
  }
  if (!timeline) {
    return <p className="py-8 text-center text-sm text-muted-foreground">请选择车辆查看全生命周期轨迹</p>;
  }
  if (timeline.events.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">暂无历史记录</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
        <p className="font-medium">
          {timeline.plateNumber} · {timeline.brand} {timeline.model}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          VIN {timeline.vin} · 当前里程 {timeline.currentMileageKm.toLocaleString()} km · 共 {timeline.events.length}{" "}
          条事件（时间升序）
        </p>
      </div>

      <ol className="relative space-y-0 border-l border-border ml-3 pl-6">
        {timeline.events.map((event, index) => (
          <TimelineItem key={event.id} event={event} isLast={index === timeline.events.length - 1} />
        ))}
      </ol>
    </div>
  );
}

function TimelineItem({ event, isLast }: { event: VehicleHistoryEvent; isLast: boolean }) {
  const style = typeStyles[event.eventType];
  const Icon = style.icon;

  return (
    <li className={cn("relative pb-6", isLast && "pb-0")}>
      <span
        className={cn(
          "absolute -left-[1.6rem] top-1.5 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-background",
          style.dot
        )}
        aria-hidden
      />
      <div
        className={cn(
          "rounded-lg border border-border bg-card p-3 shadow-sm border-l-4",
          style.border
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="font-medium text-sm">{event.title}</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {vehicleHistoryEventTypeLabel[event.eventType]}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{formatWhen(event.occurredAt)}</p>
        <p className="mt-2 text-sm">{event.summary}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {event.amount !== undefined && event.amount > 0 && (
            <span>金额 {formatMoney(event.amount)}</span>
          )}
          {event.status && <span>状态 {event.status}</span>}
          {event.refId && event.refType === "ORDER" ? (
            <Link to={`/orders/${event.refId}`} className="text-primary hover:underline">
              查看订单
            </Link>
          ) : (
            event.refId && (
              <span className="font-mono">
                {event.refType ?? "REF"} · {event.refId.slice(0, 12)}
                {event.refId.length > 12 ? "…" : ""}
              </span>
            )
          )}
        </div>
      </div>
    </li>
  );
}
