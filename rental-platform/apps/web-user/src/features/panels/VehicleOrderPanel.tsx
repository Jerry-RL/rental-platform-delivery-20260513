import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import type { Driver, Vehicle } from "../types";

type Props = {
  city: string;
  vehicleTypeId: string;
  settlementMode: "PREPAID" | "POSTPAID";
  serviceMode: "SELF_DRIVE" | "WITH_DRIVER";
  accountType: "C" | "B" | "G";
  billingAccountId: string;
  driverId: string;
  drivers: Driver[];
  vehicles: Vehicle[];
  token: string;
  onCityChange: (value: string) => void;
  onVehicleTypeIdChange: (value: string) => void;
  onSettlementModeChange: (value: "PREPAID" | "POSTPAID") => void;
  onServiceModeChange: (value: "SELF_DRIVE" | "WITH_DRIVER") => void;
  onAccountTypeChange: (value: "C" | "B" | "G") => void;
  onBillingAccountIdChange: (value: string) => void;
  onDriverIdChange: (value: string) => void;
  onSearchVehicles: () => void;
  onCreateOrder: (vehicleTypeId: string) => void;
};

export function VehicleOrderPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>车辆查询与下单</CardTitle>
        <CardDescription>按城市/车型检索车辆，并组合结算与服务模式创建订单。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input value={props.city} onChange={(event) => props.onCityChange(event.target.value)} placeholder="城市，例如 Shanghai" />
          <Input value={props.vehicleTypeId} onChange={(event) => props.onVehicleTypeIdChange(event.target.value)} placeholder="车型ID，例如 SUV" />
          <Button type="button" onClick={props.onSearchVehicles}>
            查询可租车辆
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">结算方式</span>
            <select
              value={props.settlementMode}
              onChange={(event) => props.onSettlementModeChange(event.target.value as "PREPAID" | "POSTPAID")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="PREPAID">PREPAID</option>
              <option value="POSTPAID">POSTPAID</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">服务方式</span>
            <select
              value={props.serviceMode}
              onChange={(event) => props.onServiceModeChange(event.target.value as "SELF_DRIVE" | "WITH_DRIVER")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="SELF_DRIVE">SELF_DRIVE</option>
              <option value="WITH_DRIVER">WITH_DRIVER</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">主体类型</span>
            <select
              value={props.accountType}
              onChange={(event) => props.onAccountTypeChange(event.target.value as "C" | "B" | "G")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="C">C</option>
              <option value="B">B</option>
              <option value="G">G</option>
            </select>
          </label>
          <Input value={props.billingAccountId} onChange={(event) => props.onBillingAccountIdChange(event.target.value)} placeholder="POSTPAID账务主体ID" />
          {props.serviceMode === "WITH_DRIVER" ? (
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="text-muted-foreground">指派司机</span>
              <select
                value={props.driverId}
                onChange={(event) => props.onDriverIdChange(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {props.drivers.length === 0 ? <option value="">当前城市暂无可用司机</option> : null}
                {props.drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} · {driver.driverNo} · 评分 {driver.rating}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="space-y-2">
          {props.vehicles.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">暂无车辆数据，请先查询。</div>
          ) : (
            props.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex flex-col justify-between gap-3 rounded-md border p-3 md:flex-row md:items-center"
              >
                <div className="flex items-center gap-3">
                  {vehicle.imageUrl ? (
                    <img src={vehicle.imageUrl} alt={vehicle.plateNumber} className="h-14 w-20 rounded-md border object-cover" />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline">{vehicle.plateNumber}</Badge>
                    <span>{vehicle.vehicleTypeId}</span>
                    {vehicle.brand ? <span>{vehicle.brand} {vehicle.model}</span> : null}
                    <span className="text-muted-foreground">{vehicle.city}</span>
                    <span className="font-medium">¥{vehicle.dailyPrice}/天</span>
                  </div>
                </div>
                <Button type="button" disabled={props.token.length === 0} onClick={() => props.onCreateOrder(vehicle.vehicleTypeId)}>
                  下单
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
