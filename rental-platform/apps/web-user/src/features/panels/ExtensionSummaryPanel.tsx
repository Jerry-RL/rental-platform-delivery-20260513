import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import type { ReminderSummary, ViolationTaskSummary } from "../types";

type Props = {
  reminderSummary: ReminderSummary | null;
  latestViolationTask: ViolationTaskSummary | null;
  onLoadReminderSummary: () => void;
  onLoadLatestViolationTask: () => void;
};

export function ExtensionSummaryPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>提醒与违章任务</CardTitle>
        <CardDescription>支持查看提醒摘要与最近批量违章任务状态。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-2">
          <Button type="button" onClick={props.onLoadReminderSummary}>
            读取提醒摘要
          </Button>
          <Button type="button" onClick={props.onLoadLatestViolationTask} variant="outline">
            读取最近违章任务
          </Button>
        </div>
        {props.reminderSummary ? (
          <div className="rounded-md border p-3 text-sm">
            <p>车辆总数：{props.reminderSummary.totalVehicles}</p>
            <p>30天内保险到期：{props.reminderSummary.insuranceExpiringIn30Days}</p>
            <p>30天内年审到期：{props.reminderSummary.annualReviewExpiringIn30Days}</p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">暂无提醒摘要</div>
        )}
        {props.latestViolationTask ? (
          <div className="rounded-md border p-3 text-sm">
            <p>任务ID：{props.latestViolationTask.id}</p>
            <p>状态：{props.latestViolationTask.status}</p>
            <p>车辆数：{props.latestViolationTask.totalVehicles}</p>
            <p>总成本：¥{props.latestViolationTask.totalCost.toFixed(2)}</p>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">暂无违章任务数据</div>
        )}
      </CardContent>
    </Card>
  );
}
