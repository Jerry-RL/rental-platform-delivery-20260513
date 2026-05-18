import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import type { IntegrationCost, ViolationQuota } from "../types";

type Props = {
  quota: ViolationQuota;
  costMonth: string;
  costs: IntegrationCost[];
  onQuotaChange: (quota: ViolationQuota) => void;
  onCostMonthChange: (month: string) => void;
  onLoadQuota: () => void;
  onSaveQuota: () => void;
  onLoadCosts: () => void;
};

export function QuotaCostPanel(props: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>违章查询配额</CardTitle>
          <CardDescription>支持每月额度与超额策略（DENY / APPROVAL / PAID）。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={props.quota.month}
              onChange={(event) => props.onQuotaChange({ ...props.quota, month: event.target.value })}
              placeholder="月份，例如 2026-05"
            />
            <Input
              value={String(props.quota.limit)}
              onChange={(event) => props.onQuotaChange({ ...props.quota, limit: Number(event.target.value || 0) })}
              placeholder="月度额度"
            />
            <Input
              value={String(props.quota.used)}
              onChange={(event) => props.onQuotaChange({ ...props.quota, used: Number(event.target.value || 0) })}
              placeholder="已使用次数"
            />
            <select
              value={props.quota.overageStrategy}
              onChange={(event) =>
                props.onQuotaChange({ ...props.quota, overageStrategy: event.target.value as ViolationQuota["overageStrategy"] })
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="DENY">DENY</option>
              <option value="APPROVAL">APPROVAL</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={props.onLoadQuota}>
              读取配额
            </Button>
            <Button type="button" onClick={props.onSaveQuota}>
              保存配额
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>第三方成本台账</CardTitle>
          <CardDescription>统计违章与GPS调用成本，支持月度核对。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input value={props.costMonth} onChange={(event) => props.onCostMonthChange(event.target.value)} placeholder="月份，例如 2026-05" />
            <Button type="button" onClick={props.onLoadCosts}>
              加载成本
            </Button>
          </div>
          <div className="overflow-auto rounded-md border">
            <table className="w-full min-w-[540px] text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2">日期</th>
                  <th className="px-3 py-2">类型</th>
                  <th className="px-3 py-2">数量</th>
                  <th className="px-3 py-2">单价</th>
                  <th className="px-3 py-2">总成本</th>
                </tr>
              </thead>
              <tbody>
                {props.costs.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="px-3 py-2">{record.date}</td>
                    <td className="px-3 py-2">{record.type}</td>
                    <td className="px-3 py-2">{record.quantity}</td>
                    <td className="px-3 py-2">¥{record.unitCost.toFixed(2)}</td>
                    <td className="px-3 py-2">¥{record.totalCost.toFixed(2)}</td>
                  </tr>
                ))}
                {props.costs.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-muted-foreground" colSpan={5}>
                      暂无台账记录
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
