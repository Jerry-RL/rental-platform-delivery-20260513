import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import type { MapPolicy } from "../types";

type Props = {
  mapPolicy: MapPolicy;
  gpsVehicleId: string;
  gpsSnapshotJson: string;
  onMapPolicyChange: (policy: MapPolicy) => void;
  onGpsVehicleIdChange: (value: string) => void;
  onSaveMapPolicy: () => void;
  onQueryGpsSnapshot: () => void;
};

export function MapGpsPanel(props: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>地图授权策略</CardTitle>
          <CardDescription>支持地图模式与授权状态配置，控制高风险地图能力开关。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            value={props.mapPolicy.mapMode}
            onChange={(event) => props.onMapPolicyChange({ ...props.mapPolicy, mapMode: event.target.value as MapPolicy["mapMode"] })}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="MAP_VENDOR_DIRECT">MAP_VENDOR_DIRECT</option>
            <option value="GPS_VENDOR_PROXY">GPS_VENDOR_PROXY</option>
          </select>
          <select
            value={props.mapPolicy.authStatus}
            onChange={(event) =>
              props.onMapPolicyChange({ ...props.mapPolicy, authStatus: event.target.value as MapPolicy["authStatus"] })
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="UNCONFIRMED">UNCONFIRMED</option>
            <option value="AUTHORIZED">AUTHORIZED</option>
            <option value="RESTRICTED">RESTRICTED</option>
          </select>
          <Button type="button" onClick={props.onSaveMapPolicy}>
            保存地图策略
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GPS实时快照</CardTitle>
          <CardDescription>输入车辆ID查询最新定位、速度和在线状态。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input value={props.gpsVehicleId} onChange={(event) => props.onGpsVehicleIdChange(event.target.value)} placeholder="车辆ID" />
            <Button type="button" onClick={props.onQueryGpsSnapshot}>
              查询GPS
            </Button>
          </div>
          <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{props.gpsSnapshotJson}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
