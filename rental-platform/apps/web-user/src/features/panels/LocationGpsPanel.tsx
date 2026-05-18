import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

type SelectedLocation = { name: string; lng: number; lat: number } | null;

type Props = {
  startLocationInput: string;
  selectedStartLocation: SelectedLocation;
  gpsVehicleId: string;
  gpsRealtimeJson: string;
  gpsTrackJson: string;
  onStartLocationInputChange: (value: string) => void;
  onSelectStartLocation: () => void;
  onGpsVehicleIdChange: (value: string) => void;
  onLoadGpsRealtime: () => void;
  onLoadGpsTrack: () => void;
};

export function LocationGpsPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>6) 扩展能力：起点位置 + GPS</CardTitle>
        <CardDescription>模拟小程序约车起点输入，并查看车辆实时位置与轨迹。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <Input value={props.startLocationInput} onChange={(event) => props.onStartLocationInputChange(event.target.value)} placeholder="起点位置关键字" />
          <Button type="button" onClick={props.onSelectStartLocation}>
            选中起点
          </Button>
        </div>
        {props.selectedStartLocation ? (
          <div className="rounded-md border p-3 text-sm">
            <p>位置：{props.selectedStartLocation.name}</p>
            <p>
              坐标：{props.selectedStartLocation.lng}, {props.selectedStartLocation.lat}
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">未选择起点</div>
        )}
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <Input value={props.gpsVehicleId} onChange={(event) => props.onGpsVehicleIdChange(event.target.value)} placeholder="车辆ID" />
          <Button type="button" onClick={props.onLoadGpsRealtime}>
            实时位置
          </Button>
          <Button type="button" onClick={props.onLoadGpsTrack} variant="outline">
            历史轨迹
          </Button>
        </div>
        <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{props.gpsRealtimeJson}</pre>
        <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{props.gpsTrackJson}</pre>
      </CardContent>
    </Card>
  );
}
