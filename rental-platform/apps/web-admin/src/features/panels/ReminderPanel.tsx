import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import type { ReminderRule } from "../types";

type Props = {
  rule: ReminderRule;
  logsJson: string;
  onRuleChange: (rule: ReminderRule) => void;
  onSaveRule: () => void;
  onLoadLogs: () => void;
};

export function ReminderPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>到期提醒规则与日志</CardTitle>
        <CardDescription>支持保险/年审提醒规则配置与最近发送记录查询。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={props.rule.insuranceEnabled}
              onChange={(event) => props.onRuleChange({ ...props.rule, insuranceEnabled: event.target.checked })}
            />
            保险提醒
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={props.rule.annualReviewEnabled}
              onChange={(event) => props.onRuleChange({ ...props.rule, annualReviewEnabled: event.target.checked })}
            />
            年审提醒
          </label>
          <Input
            value={String(props.rule.remindBeforeDays)}
            onChange={(event) => props.onRuleChange({ ...props.rule, remindBeforeDays: Number(event.target.value || 0) })}
            placeholder="提前提醒天数"
          />
          <Button type="button" onClick={props.onSaveRule}>
            保存规则
          </Button>
        </div>
        <Button type="button" variant="outline" onClick={props.onLoadLogs}>
          读取提醒日志
        </Button>
        <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{props.logsJson}</pre>
      </CardContent>
    </Card>
  );
}
