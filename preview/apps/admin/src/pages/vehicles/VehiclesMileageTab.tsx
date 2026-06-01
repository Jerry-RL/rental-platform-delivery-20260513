import { useEffect, useState } from "react";
import {
  api,
  maintenanceReminderLabel,
  mileageSourceLabel,
  type MaintenanceReminder,
  type MileageRecord,
  type PageResult
} from "@rental-preview/shared";
import { Gauge } from "lucide-react";
import { ListFilterForm } from "../../components/shared/ListFilterForm";
import { DataTable } from "../../components/shared/DataTable";
import { buildQueryPath } from "../../lib/query";
import { Badge } from "../../components/ui/badge";
import { useFilteredList } from "../../hooks/useFilteredList";

export function VehiclesMileageTab() {
  const mileage = useFilteredList<MileageRecord>("/api/v1/admin/mileage-records", {
    plateNumber: "",
    source: ""
  });
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [reminderFilter, setReminderFilter] = useState({ level: "", plateNumber: "" });

  const loadReminders = async () => {
    const path = buildQueryPath("/api/v1/admin/maintenance-reminders", {
      ...reminderFilter,
      pageSize: "50"
    });
    const res = await api.get<PageResult<MaintenanceReminder>>(path);
    if (res.ok && res.data) setReminders(res.data.items);
  };

  useEffect(() => {
    void loadReminders();
  }, []);

  const reminderBadge = (level: MaintenanceReminder["level"]) => {
    const v = level === "OK" ? "success" : level === "DUE_SOON" ? "warning" : "destructive";
    return <Badge variant={v === "destructive" ? "warning" : v}>{maintenanceReminderLabel[level]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        还车/GPS/人工录入里程 → 按间隔自动计算保养提醒（BR + FR-VEH-006）
      </p>
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
        计算公式：下次保养里程 = 上次保养里程 + 保养间隔（默认 10000km）；剩余 ≤2000km 为「即将保养」
      </p>
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
    </div>
  );
}
