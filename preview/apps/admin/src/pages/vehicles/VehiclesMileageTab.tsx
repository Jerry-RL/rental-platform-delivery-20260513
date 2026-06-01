import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  maintenanceReminderLabel,
  mileageMonitorLabel,
  mileageSourceLabel,
  scrapReminderLabel,
  type MaintenanceReminder,
  type MileageMonitor,
  type MileageRecord,
  type PageResult,
  type ScrapReminder
} from "@rental-preview/shared";
import { AlertTriangle, Gauge, Recycle } from "lucide-react";
import { ListFilterForm } from "../../components/shared/ListFilterForm";
import { DataTable } from "../../components/shared/DataTable";
import { buildQueryPath } from "../../lib/query";
import { Badge } from "../../components/ui/badge";
import { useFilteredList } from "../../hooks/useFilteredList";

type FleetSummary = { scrapDue: number; mileageAlert: number; maintDue: number };

export function VehiclesMileageTab() {
  const mileage = useFilteredList<MileageRecord>("/api/v1/admin/mileage-records", {
    plateNumber: "",
    source: ""
  });
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [reminderFilter, setReminderFilter] = useState({ level: "", plateNumber: "" });
  const [scrapItems, setScrapItems] = useState<ScrapReminder[]>([]);
  const [scrapFilter, setScrapFilter] = useState({ level: "", plateNumber: "" });
  const [monitorItems, setMonitorItems] = useState<MileageMonitor[]>([]);
  const [monitorFilter, setMonitorFilter] = useState({ level: "", plateNumber: "" });
  const [summary, setSummary] = useState<FleetSummary | null>(null);

  const loadReminders = async () => {
    const path = buildQueryPath("/api/v1/admin/maintenance-reminders", {
      ...reminderFilter,
      pageSize: "50"
    });
    const res = await api.get<PageResult<MaintenanceReminder>>(path);
    if (res.ok && res.data) setReminders(res.data.items);
  };

  const loadScrap = async () => {
    const path = buildQueryPath("/api/v1/admin/scrap-reminders", {
      ...scrapFilter,
      pageSize: "50"
    });
    const res = await api.get<PageResult<ScrapReminder>>(path);
    if (res.ok && res.data) setScrapItems(res.data.items);
  };

  const loadMonitor = async () => {
    const path = buildQueryPath("/api/v1/admin/mileage-monitor", {
      ...monitorFilter,
      pageSize: "50"
    });
    const res = await api.get<PageResult<MileageMonitor>>(path);
    if (res.ok && res.data) setMonitorItems(res.data.items);
  };

  const loadSummary = useCallback(async () => {
    const res = await api.get<FleetSummary>("/api/v1/admin/fleet-monitor/summary");
    if (res.ok && res.data) setSummary(res.data);
  }, []);

  useEffect(() => {
    void loadReminders();
    void loadScrap();
    void loadMonitor();
    void loadSummary();
  }, [loadSummary]);

  const reminderBadge = (level: MaintenanceReminder["level"]) => {
    const v = level === "OK" ? "success" : level === "DUE_SOON" ? "warning" : "destructive";
    return <Badge variant={v === "destructive" ? "warning" : v}>{maintenanceReminderLabel[level]}</Badge>;
  };

  const scrapBadge = (level: ScrapReminder["level"]) => {
    const v =
      level === "OK" || level === "RETIRED"
        ? "secondary"
        : level === "DUE_SOON"
          ? "warning"
          : "warning";
    return <Badge variant={v}>{scrapReminderLabel[level]}</Badge>;
  };

  const monitorBadge = (level: MileageMonitor["level"]) => {
    const v =
      level === "NORMAL"
        ? "success"
        : level === "HIGH_USAGE"
          ? "secondary"
          : "warning";
    return <Badge variant={v}>{mileageMonitorLabel[level]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        还车/GPS/人工录入里程 → 保养提醒 · 报废车龄/里程阈值 · 异常跳变与高里程监控（FR-VEH-006 扩展）
      </p>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
            <p className="flex items-center gap-1 text-muted-foreground">
              <Recycle className="h-3.5 w-3.5" />
              报废提醒
            </p>
            <p className="mt-1 text-2xl font-semibold text-warning">{summary.scrapDue}</p>
            <p className="text-xs text-muted-foreground">即将/建议报废</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="flex items-center gap-1 text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              里程监控
            </p>
            <p className="mt-1 text-2xl font-semibold">{summary.mileageAlert}</p>
            <p className="text-xs text-muted-foreground">异常/高里程/久未同步</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="flex items-center gap-1 text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              保养提醒
            </p>
            <p className="mt-1 text-2xl font-semibold">{summary.maintDue}</p>
            <p className="text-xs text-muted-foreground">即将/已超期保养</p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">报废提醒</h3>
        <p className="text-xs text-muted-foreground">
          默认上限：里程 120,000 km · 车龄 8 年（单车可配置 purchaseDate / scrapMileageLimitKm）
        </p>
        <ListFilterForm
          fields={[
            { key: "plateNumber", label: "车牌", type: "text", placeholder: "沪" },
            {
              key: "level",
              label: "提醒级别",
              type: "select",
              options: [
                { value: "OVERDUE", label: "建议报废" },
                { value: "DUE_SOON", label: "即将报废" }
              ]
            }
          ]}
          values={scrapFilter}
          onChange={(k, v) => setScrapFilter((p) => ({ ...p, [k]: v }))}
          onSearch={() => void loadScrap()}
          onReset={() => {
            setScrapFilter({ level: "", plateNumber: "" });
            void loadScrap();
          }}
        />
        <DataTable
          rows={scrapItems.map((r) => ({ ...r, id: r.vehicleId }))}
          columns={[
            {
              key: "plate",
              header: "车牌",
              render: (r) => (
                <Link
                  to={`/vehicles/${r.vehicleId}/history`}
                  className="text-primary hover:underline"
                >
                  {r.plateNumber}
                </Link>
              )
            },
            { key: "model", header: "车型", render: (r) => `${r.brand} ${r.model}` },
            {
              key: "km",
              header: "当前/上限",
              render: (r) =>
                `${r.currentMileageKm.toLocaleString()} / ${r.scrapMileageLimitKm.toLocaleString()} km`
            },
            {
              key: "age",
              header: "车龄",
              render: (r) => `${r.serviceYears.toFixed(1)} / ${r.maxServiceYears} 年`
            },
            {
              key: "left",
              header: "剩余",
              render: (r) =>
                r.kmUntilScrap > 0
                  ? `${r.kmUntilScrap.toLocaleString()} km`
                  : `超 ${Math.abs(r.kmUntilScrap).toLocaleString()} km`
            },
            { key: "lvl", header: "状态", render: (r) => scrapBadge(r.level) },
            { key: "reason", header: "说明", render: (r) => r.reason }
          ]}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">里程监控</h3>
        <p className="text-xs text-muted-foreground">
          单次录入跳变 ≥1500 km 为异常；近程日均 ≥350 km 为高里程；45 天无记录为久未同步
        </p>
        <ListFilterForm
          fields={[
            { key: "plateNumber", label: "车牌", type: "text" },
            {
              key: "level",
              label: "监控级别",
              type: "select",
              options: [
                { value: "ANOMALY", label: "异常跳变" },
                { value: "HIGH_USAGE", label: "高里程" },
                { value: "STALE", label: "久未同步" }
              ]
            }
          ]}
          values={monitorFilter}
          onChange={(k, v) => setMonitorFilter((p) => ({ ...p, [k]: v }))}
          onSearch={() => void loadMonitor()}
          onReset={() => {
            setMonitorFilter({ level: "", plateNumber: "" });
            void loadMonitor();
          }}
        />
        <DataTable
          rows={monitorItems.map((r) => ({ ...r, id: r.vehicleId }))}
          columns={[
            {
              key: "plate",
              header: "车牌",
              render: (r) => (
                <Link
                  to={`/vehicles/${r.vehicleId}/history`}
                  className="text-primary hover:underline"
                >
                  {r.plateNumber}
                </Link>
              )
            },
            { key: "km", header: "当前里程", render: (r) => `${r.currentMileageKm.toLocaleString()} km` },
            {
              key: "delta",
              header: "最近增量",
              render: (r) => (r.lastDeltaKm != null ? `+${r.lastDeltaKm} km` : "—")
            },
            {
              key: "avg",
              header: "日均",
              render: (r) => (r.avgKmPerDay != null ? `${r.avgKmPerDay} km/天` : "—")
            },
            { key: "lvl", header: "级别", render: (r) => monitorBadge(r.level) },
            { key: "hint", header: "说明", render: (r) => r.hint }
          ]}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">保养提醒</h3>
        <ListFilterForm
          fields={[
            { key: "plateNumber", label: "车牌", type: "text", placeholder: "沪" },
            {
              key: "level",
              label: "提醒级别",
              type: "select",
              options: [
                { value: "OVERDUE", label: "已超期" },
                { value: "DUE_SOON", label: "即将保养" },
                { value: "OK", label: "正常" }
              ]
            }
          ]}
          values={reminderFilter}
          onChange={(k, v) => setReminderFilter((p) => ({ ...p, [k]: v }))}
          onSearch={() => void loadReminders()}
          onReset={() => {
            setReminderFilter({ level: "", plateNumber: "" });
            void loadReminders();
          }}
        />
        <DataTable
          rows={reminders.map((r) => ({ ...r, id: r.vehicleId }))}
          columns={[
            { key: "plate", header: "车牌", render: (r) => r.plateNumber },
            { key: "model", header: "车型", render: (r) => `${r.brand} ${r.model}` },
            { key: "cur", header: "当前里程", render: (r) => `${r.currentMileageKm.toLocaleString()} km` },
            { key: "next", header: "保养里程线", render: (r) => `${r.nextDueMileageKm.toLocaleString()} km` },
            {
              key: "left",
              header: "剩余",
              render: (r) => (
                <span className={r.kmUntilDue < 0 ? "text-warning font-medium" : ""}>
                  {r.kmUntilDue >= 0 ? `还剩 ${r.kmUntilDue} km` : `超期 ${Math.abs(r.kmUntilDue)} km`}
                </span>
              )
            },
            { key: "lvl", header: "级别", render: (r) => reminderBadge(r.level) },
            { key: "date", header: "预估日期", render: (r) => r.estimatedDueDate ?? "—" }
          ]}
        />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Gauge className="h-3.5 w-3.5" />
          下次保养里程 = 上次保养里程 + 间隔（默认 10000km）；剩余 ≤2000km 为「即将保养」
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">里程流水</h3>
        <ListFilterForm
          fields={[
            { key: "plateNumber", label: "车牌", type: "text" },
            {
              key: "source",
              label: "来源",
              type: "select",
              options: [
                { value: "ORDER_RETURN", label: "还车验收" },
                { value: "MANUAL", label: "人工录入" },
                { value: "GPS_SYNC", label: "GPS 同步" }
              ]
            }
          ]}
          values={mileage.filters}
          onChange={mileage.setFilter}
          onSearch={mileage.search}
          onReset={mileage.reset}
          loading={mileage.loading}
        />
        <DataTable
          rows={mileage.items}
          columns={[
            { key: "plate", header: "车牌", render: (r) => r.plateNumber },
            { key: "km", header: "里程", render: (r) => `${r.mileageKm.toLocaleString()} km` },
            { key: "delta", header: "增量", render: (r) => `+${r.deltaKm} km` },
            { key: "src", header: "来源", render: (r) => mileageSourceLabel[r.source] },
            { key: "at", header: "记录时间", render: (r) => r.recordedAt.slice(0, 16).replace("T", " ") }
          ]}
        />
      </section>
    </div>
  );
}
