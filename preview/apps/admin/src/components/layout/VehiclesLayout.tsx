import { Outlet } from "react-router-dom";
import { previewStore } from "@rental-preview/shared";
import { PageTabs } from "../ui/page-tabs";
import { Badge } from "../ui/badge";

const vehicleTabs = [
  { to: "/vehicles/inventory", label: "车辆库存" },
  { to: "/vehicles/history", label: "生命周期" },
  { to: "/vehicles/mileage", label: "里程保养" },
  { to: "/vehicles/violations", label: "违章查询" },
  { to: "/vehicles/maintenance", label: "维保送修" }
] as const;

export function VehiclesLayout() {
  const stats = {
    total: previewStore.vehicles.length,
    available: previewStore.vehicles.filter((v) => v.status === "AVAILABLE").length
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">车辆管理</h2>
        <p className="text-sm text-muted-foreground">
          FR-VEH-006/007 · 购买/保养/保险/维修/订单全生命周期 · 车队 {stats.total} 台
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">可用 {stats.available}</Badge>
          <Badge variant="outline">品牌 15+</Badge>
          <Badge variant="outline">数脉违章批量</Badge>
        </div>
      </div>

      <PageTabs
        tabs={vehicleTabs.map((t) => ({
          ...t,
          badge:
            t.to === "/vehicles/inventory" ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {stats.total}
              </Badge>
            ) : undefined
        }))}
        ariaLabel="车辆管理分区"
      />

      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
