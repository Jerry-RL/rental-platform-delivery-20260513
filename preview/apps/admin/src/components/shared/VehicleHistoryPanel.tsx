import { useCallback, useEffect, useState } from "react";
import { api, IDS, type Vehicle, type VehicleHistoryTimeline, type PageResult } from "@rental-preview/shared";
import { VehicleHistoryTimelineView } from "./VehicleHistoryTimeline";
import { Button } from "../ui/button";
import { Select } from "../ui/select";

type VehicleHistoryPanelProps = {
  initialVehicleId?: string;
  /** 详情页固定车辆，隐藏选择器 */
  fixedVehicleId?: string;
};

export function VehicleHistoryPanel({
  initialVehicleId = IDS.vehicle1,
  fixedVehicleId
}: VehicleHistoryPanelProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState(fixedVehicleId ?? initialVehicleId);
  const [timeline, setTimeline] = useState<VehicleHistoryTimeline | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fixedVehicleId) setVehicleId(fixedVehicleId);
  }, [fixedVehicleId]);

  useEffect(() => {
    if (fixedVehicleId) return;
    void api.get<PageResult<Vehicle>>("/api/v1/vehicles?pageSize=50&plateNumber=").then((res) => {
      if (res.ok && res.data) {
        setVehicles(res.data.items);
        if (!res.data.items.some((v) => v.id === vehicleId) && res.data.items[0]) {
          setVehicleId(res.data.items[0].id);
        }
      }
    });
  }, [fixedVehicleId]);

  const loadHistory = useCallback(async (id: string) => {
    setLoading(true);
    const res = await api.get<VehicleHistoryTimeline>(`/api/v1/admin/vehicles/${id}/history`);
    setTimeline(res.ok ? res.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (vehicleId) void loadHistory(vehicleId);
  }, [vehicleId, loadHistory]);

  const handleQuick = (id: string) => {
    setVehicleId(id);
  };

  return (
    <div className="space-y-4">
      {!fixedVehicleId && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-xs text-muted-foreground">
            选择车辆
            <Select
              wrapperClassName="mt-1 min-w-[260px]"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              aria-label="选择车辆"
              options={vehicles.map((v) => ({
                value: v.id,
                label: `${v.plateNumber} · ${v.brand} ${v.model}`
              }))}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: IDS.vehicle1, label: "沪A12345" },
              { id: IDS.vehicle2, label: "沪B98765" },
              { id: IDS.vehicle3, label: "京C66889" }
            ].map((q) => (
              <Button
                key={q.id}
                type="button"
                size="sm"
                variant={vehicleId === q.id ? "default" : "outline"}
                onClick={() => handleQuick(q.id)}
              >
                {q.label}
              </Button>
            ))}
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => void loadHistory(vehicleId)}>
            刷新
          </Button>
        </div>
      )}
      {fixedVehicleId && (
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="outline" onClick={() => void loadHistory(vehicleId)}>
            刷新轨迹
          </Button>
        </div>
      )}
      <VehicleHistoryTimelineView timeline={timeline} loading={loading} />
    </div>
  );
}
