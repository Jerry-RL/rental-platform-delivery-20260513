import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import type { ViolationTask } from "../types";

type Props = {
  vehiclesText: string;
  tasks: ViolationTask[];
  resultJson: string;
  onVehiclesTextChange: (value: string) => void;
  onCreateTask: () => void;
};

export function ViolationPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>批量违章任务</CardTitle>
        <CardDescription>支持批量提交、任务状态查看、费用汇总。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={props.vehiclesText}
          onChange={(event) => props.onVehiclesTextChange(event.target.value)}
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="每行一个车牌或车辆ID，也支持逗号分隔"
        />
        <Button type="button" onClick={props.onCreateTask}>
          创建批量任务
        </Button>
        <div className="overflow-auto rounded-md border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2">任务ID</th>
                <th className="px-3 py-2">状态</th>
                <th className="px-3 py-2">车辆数</th>
                <th className="px-3 py-2">成功/失败</th>
                <th className="px-3 py-2">总成本</th>
                <th className="px-3 py-2">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {props.tasks.map((task) => (
                <tr key={task.id} className="border-t">
                  <td className="px-3 py-2">{task.id}</td>
                  <td className="px-3 py-2">{task.status}</td>
                  <td className="px-3 py-2">{task.totalVehicles}</td>
                  <td className="px-3 py-2">
                    {task.successVehicles}/{task.failedVehicles}
                  </td>
                  <td className="px-3 py-2">¥{task.totalCost.toFixed(2)}</td>
                  <td className="px-3 py-2">{new Date(task.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {props.tasks.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={6}>
                    暂无任务
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{props.resultJson}</pre>
      </CardContent>
    </Card>
  );
}
