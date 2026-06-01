import { Link, useParams } from "react-router-dom";
import { previewStore } from "@rental-preview/shared";
import { VehicleHistoryPanel } from "../components/shared/VehicleHistoryPanel";
import { PageTabs } from "../components/ui/page-tabs";
import { Badge } from "../components/ui/badge";

const vehicleTabs = [
  { to: "/vehicles/inventory", label: "车辆库存" },
  { to: "/vehicles/history", label: "生命周期" },
  { to: "/vehicles/mileage", label: "里程保养" },
  { to: "/vehicles/violations", label: "违章查询" },
  { to: "/vehicles/maintenance", label: "维保送修" }
];

export function VehicleHistoryDetailPage() {
  const { vehicleId } = useParams();
  const total = previewStore.vehicles.length;

  if (!vehicleId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">缺少车辆 ID</p>
        <Link to="/vehicles/inventory" className="text-sm text-primary hover:underline">
          ← 返回车辆库存
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">车辆管理</h2>
        <p className="text-sm text-muted-foreground">单车辆全生命周期轨迹详情 · 车队 {total} 台</p>
      </div>

      <PageTabs
        tabs={vehicleTabs.map((t) => ({
          ...t,
          badge:
            t.to === "/vehicles/inventory" ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {total}
              </Badge>
            ) : undefined
        }))}
        ariaLabel="车辆管理分区"
      />

      <Link to="/vehicles/inventory" className="inline-block text-sm text-primary hover:underline">
        ← 车辆库存
      </Link>

      <div>
        <h3 className="text-base font-medium">全生命周期轨迹</h3>
        <p className="text-xs text-muted-foreground">
          FR-VEH-006/007 · GET /api/v1/admin/vehicles/:id/history
        </p>
      </div>

      <VehicleHistoryPanel fixedVehicleId={vehicleId} />
    </div>
  );
}
