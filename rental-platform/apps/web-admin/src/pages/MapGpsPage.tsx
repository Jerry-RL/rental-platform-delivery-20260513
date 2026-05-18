import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { MapGpsPanel } from "../features/panels/MapGpsPanel";

export function MapGpsPage() {
  const { ops } = useAdminFlowContext();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="地图与 GPS" description="地图服务策略配置与车辆 GPS 快照查询。" />
      <MapGpsPanel
        mapPolicy={ops.mapPolicy}
        gpsVehicleId={ops.gpsVehicleId}
        gpsSnapshotJson={ops.gpsSnapshotJson}
        onMapPolicyChange={ops.setMapPolicy}
        onGpsVehicleIdChange={ops.setGpsVehicleId}
        onSaveMapPolicy={ops.handleSaveMapPolicy}
        onQueryGpsSnapshot={ops.handleQueryGpsSnapshot}
      />
    </div>
  );
}
