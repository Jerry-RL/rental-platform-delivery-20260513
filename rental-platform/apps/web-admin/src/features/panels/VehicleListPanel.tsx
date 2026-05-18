import { PaginationBar } from "../../components/shared/PaginationBar";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { reminderLabel, vehicleStatusLabel, VEHICLE_STATUS_OPTIONS } from "../../lib/labels";
import type { Vehicle, VehicleReminderLevel } from "../types";

type Filters = {
  city: string;
  vehicleTypeId: string;
  status: string;
  keyword: string;
  reminder: string;
};

type Props = {
  filters: Filters;
  loading: boolean;
  items: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onStatusChange: (vehicleId: string, status: Vehicle["status"]) => void;
};

const ReminderBadge = ({ level, date }: { level?: VehicleReminderLevel; date?: string }) => {
  if (!date) {
    return <span className="text-xs text-muted-foreground">未设置</span>;
  }
  return <StatusBadge label={`${reminderLabel(level ?? "UNKNOWN")} · ${date}`} status={level ?? "UNKNOWN"} />;
};

export function VehicleListPanel(props: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>车辆列表</CardTitle>
          <CardDescription>全量库存管理，支持保险/年检到期筛选与提醒状态展示。</CardDescription>
        </div>
        <Button type="button" onClick={props.onCreate}>
          新增车辆
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <Input placeholder="城市" value={props.filters.city} onChange={(e) => props.onFiltersChange({ ...props.filters, city: e.target.value })} />
          <Input placeholder="车型" value={props.filters.vehicleTypeId} onChange={(e) => props.onFiltersChange({ ...props.filters, vehicleTypeId: e.target.value })} />
          <select
            value={props.filters.status}
            onChange={(e) => props.onFiltersChange({ ...props.filters, status: e.target.value })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">全部状态</option>
            {VEHICLE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {vehicleStatusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={props.filters.reminder}
            onChange={(e) => props.onFiltersChange({ ...props.filters, reminder: e.target.value })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">到期提醒</option>
            <option value="expiring">即将/已到期</option>
          </select>
          <Input placeholder="车牌/品牌/型号" value={props.filters.keyword} onChange={(e) => props.onFiltersChange({ ...props.filters, keyword: e.target.value })} />
        </div>
        <Button type="button" onClick={props.onSearch} disabled={props.loading}>
          {props.loading ? "加载中…" : "查询"}
        </Button>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">车辆</th>
                <th className="px-4 py-3 font-medium">车型/城市</th>
                <th className="px-4 py-3 font-medium">日租金</th>
                <th className="px-4 py-3 font-medium">保险到期</th>
                <th className="px-4 py-3 font-medium">年检到期</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {props.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    暂无车辆数据
                  </td>
                </tr>
              ) : (
                props.items.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.plateNumber}
                          className="h-12 w-16 rounded-md border border-border object-cover"
                        />
                        <div>
                          <div className="font-medium">{vehicle.plateNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {vehicle.brand} {vehicle.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {vehicle.vehicleTypeId}
                      <span className="block text-xs text-muted-foreground">{vehicle.city}</span>
                    </td>
                    <td className="px-4 py-3">¥{vehicle.dailyPrice}</td>
                    <td className="px-4 py-3">
                      <ReminderBadge level={vehicle.insuranceReminder} date={vehicle.insuranceExpiryDate?.slice(0, 10)} />
                    </td>
                    <td className="px-4 py-3">
                      <ReminderBadge level={vehicle.annualReviewReminder} date={vehicle.annualReviewExpiryDate?.slice(0, 10)} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={vehicle.status}
                        onChange={(e) => props.onStatusChange(vehicle.id, e.target.value as Vehicle["status"])}
                        className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {VEHICLE_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {vehicleStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => props.onEdit(vehicle)}>
                          编辑
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => props.onDelete(vehicle)}>
                          删除
                        </Button>
                      </div>
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
