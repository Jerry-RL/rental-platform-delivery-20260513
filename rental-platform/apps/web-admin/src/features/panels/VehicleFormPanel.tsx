import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { VEHICLE_STATUS_OPTIONS, vehicleStatusLabel } from "../../lib/labels";
import type { VehicleForm } from "../types";

type Props = {
  mode: "create" | "edit";
  form: VehicleForm;
  onChange: (form: VehicleForm) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function VehicleFormPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.mode === "create" ? "新增车辆" : "编辑车辆"}</CardTitle>
        <CardDescription>维护车辆基础信息、展示图片及保险/年检到期提醒配置。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="车牌号 *" value={props.form.plateNumber} onChange={(e) => props.onChange({ ...props.form, plateNumber: e.target.value })} />
          <Input placeholder="车型 *" value={props.form.vehicleTypeId} onChange={(e) => props.onChange({ ...props.form, vehicleTypeId: e.target.value })} />
          <Input placeholder="城市 *" value={props.form.city} onChange={(e) => props.onChange({ ...props.form, city: e.target.value })} />
          <Input placeholder="品牌" value={props.form.brand} onChange={(e) => props.onChange({ ...props.form, brand: e.target.value })} />
          <Input placeholder="型号" value={props.form.model} onChange={(e) => props.onChange({ ...props.form, model: e.target.value })} />
          <Input placeholder="日租金 *" type="number" value={props.form.dailyPrice} onChange={(e) => props.onChange({ ...props.form, dailyPrice: e.target.value })} />
          <Input placeholder="VIN" value={props.form.vin} onChange={(e) => props.onChange({ ...props.form, vin: e.target.value })} />
          <Input placeholder="里程(km)" type="number" value={props.form.mileage} onChange={(e) => props.onChange({ ...props.form, mileage: e.target.value })} />
          <select
            value={props.form.status}
            onChange={(e) => props.onChange({ ...props.form, status: e.target.value as VehicleForm["status"] })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {VEHICLE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {vehicleStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <Input
          placeholder="车辆图片 URL（支持 https 外链）"
          value={props.form.imageUrl}
          onChange={(e) => props.onChange({ ...props.form, imageUrl: e.target.value })}
        />
        {props.form.imageUrl ? (
          <img src={props.form.imageUrl} alt="车辆预览" className="h-32 w-48 rounded-lg border border-border object-cover" />
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">保险到期日</span>
            <Input type="date" value={props.form.insuranceExpiryDate} onChange={(e) => props.onChange({ ...props.form, insuranceExpiryDate: e.target.value })} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">年检到期日</span>
            <Input type="date" value={props.form.annualReviewExpiryDate} onChange={(e) => props.onChange({ ...props.form, annualReviewExpiryDate: e.target.value })} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">提前提醒(天)</span>
            <Input type="number" min={1} max={180} value={props.form.remindBeforeDays} onChange={(e) => props.onChange({ ...props.form, remindBeforeDays: e.target.value })} />
          </label>
        </div>

        <div className="flex gap-2">
          <Button type="button" onClick={props.onSave}>
            保存
          </Button>
          <Button type="button" variant="outline" onClick={props.onCancel}>
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
