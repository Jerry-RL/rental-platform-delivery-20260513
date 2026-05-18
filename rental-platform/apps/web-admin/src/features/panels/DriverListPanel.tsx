import { PaginationBar } from "../../components/shared/PaginationBar";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { DRIVER_STATUS_OPTIONS, driverStatusLabel, reminderLabel } from "../../lib/labels";
import type { Driver, VehicleReminderLevel } from "../types";

type Filters = { city: string; status: string; keyword: string; reminder: string };

type Props = {
  filters: Filters;
  loading: boolean;
  items: Driver[];
  total: number;
  page: number;
  pageSize: number;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onEdit: (driver: Driver) => void;
  onStatusChange: (driverId: string, status: Driver["status"]) => void;
};

const LicenseReminderBadge = ({ level, date }: { level?: VehicleReminderLevel; date?: string }) => {
  if (!date) {
    return <span className="text-xs text-muted-foreground">未设置</span>;
  }
  return <StatusBadge label={`${reminderLabel(level ?? "UNKNOWN")} · ${date.slice(0, 10)}`} status={level ?? "UNKNOWN"} />;
};

export function DriverListPanel(props: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>司机列表</CardTitle>
          <CardDescription>管理司机档案、驾照到期提醒与调度状态。</CardDescription>
        </div>
        <Button type="button" onClick={props.onCreate}>
          新增司机
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <Input placeholder="城市" value={props.filters.city} onChange={(e) => props.onFiltersChange({ ...props.filters, city: e.target.value })} />
          <select
            value={props.filters.status}
            onChange={(e) => props.onFiltersChange({ ...props.filters, status: e.target.value })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">全部状态</option>
            {DRIVER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {driverStatusLabel(s)}
              </option>
            ))}
          </select>
          <select
            value={props.filters.reminder}
            onChange={(e) => props.onFiltersChange({ ...props.filters, reminder: e.target.value })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">驾照到期</option>
            <option value="expiring">即将/已到期</option>
          </select>
          <Input placeholder="姓名/手机/工号" value={props.filters.keyword} onChange={(e) => props.onFiltersChange({ ...props.filters, keyword: e.target.value })} />
          <Button type="button" onClick={props.onSearch} disabled={props.loading}>
            {props.loading ? "加载中…" : "查询"}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1020px] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">司机</th>
                <th className="px-4 py-3 font-medium">手机/城市</th>
                <th className="px-4 py-3 font-medium">驾照</th>
                <th className="px-4 py-3 font-medium">到期日</th>
                <th className="px-4 py-3 font-medium">评分</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {props.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    暂无司机数据
                  </td>
                </tr>
              ) : (
                props.items.map((driver) => (
                  <tr key={driver.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={driver.licenseImageUrl}
                          alt={`${driver.name} 驾照`}
                          className="h-12 w-16 rounded-md border border-border object-cover"
                        />
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-xs text-muted-foreground">{driver.driverNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {driver.phone}
                      <span className="block text-xs text-muted-foreground">{driver.city}</span>
                    </td>
                    <td className="px-4 py-3">
                      {driver.licenseType}
                      <span className="block text-xs text-muted-foreground">{driver.licenseNo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <LicenseReminderBadge level={driver.licenseReminder} date={driver.licenseExpiryDate} />
                    </td>
                    <td className="px-4 py-3">{driver.rating.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={driver.status}
                        onChange={(e) => props.onStatusChange(driver.id, e.target.value as Driver["status"])}
                        className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {DRIVER_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {driverStatusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => props.onEdit(driver)}>
                        编辑
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar page={props.page} pageSize={props.pageSize} total={props.total} onPageChange={props.onPageChange} />
      </CardContent>
    </Card>
  );
}
