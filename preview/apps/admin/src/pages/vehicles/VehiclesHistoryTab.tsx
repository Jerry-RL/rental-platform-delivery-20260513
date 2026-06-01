import { IDS } from "@rental-preview/shared";
import { VehicleHistoryPanel } from "../../components/shared/VehicleHistoryPanel";

export function VehiclesHistoryTab() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        GET /api/v1/admin/vehicles/:id/history · 购买·保养·保险·维修·订单
      </p>
      <VehicleHistoryPanel initialVehicleId={IDS.vehicle1} />
    </div>
  );
}
