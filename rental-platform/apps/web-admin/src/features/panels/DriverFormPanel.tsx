import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { DRIVER_STATUS_OPTIONS, driverStatusLabel } from "../../lib/labels";
import type { DriverForm } from "../types";

type Props = {
  mode: "create" | "edit";
  form: DriverForm;
  onChange: (form: DriverForm) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function DriverFormPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.mode === "create" ? "新增司机" : "编辑司机"}</CardTitle>
        <CardDescription>维护司机档案、驾照扫描件（图片 URL）及驾照到期提醒。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="姓名 *" value={props.form.name} onChange={(e) => props.onChange({ ...props.form, name: e.target.value })} />
          <Input placeholder="手机号 *" value={props.form.phone} onChange={(e) => props.onChange({ ...props.form, phone: e.target.value })} />
          <Input placeholder="城市 *" value={props.form.city} onChange={(e) => props.onChange({ ...props.form, city: e.target.value })} />
          <Input placeholder="驾照号 *" value={props.form.licenseNo} onChange={(e) => props.onChange({ ...props.form, licenseNo: e.target.value })} />
          <Input placeholder="准驾车型" value={props.form.licenseType} onChange={(e) => props.onChange({ ...props.form, licenseType: e.target.value })} />
          <select
            value={props.form.status}
            onChange={(e) => props.onChange({ ...props.form, status: e.target.value as DriverForm["status"] })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {DRIVER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {driverStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <Input
          placeholder="驾照图片 URL（支持 https 外链，正反面可填多张时后续扩展）"
          value={props.form.licenseImageUrl}
          onChange={(e) => props.onChange({ ...props.form, licenseImageUrl: e.target.value })}
        />
        {props.form.licenseImageUrl ? (
          <img src={props.form.licenseImageUrl} alt="驾照预览" className="h-36 w-56 rounded-lg border border-border object-cover" />
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">驾照到期日</span>
            <Input type="date" value={props.form.licenseExpiryDate} onChange={(e) => props.onChange({ ...props.form, licenseExpiryDate: e.target.value })} />
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
