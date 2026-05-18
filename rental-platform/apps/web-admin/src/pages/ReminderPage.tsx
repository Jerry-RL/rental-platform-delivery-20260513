import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { ReminderPanel } from "../features/panels/ReminderPanel";

export function ReminderPage() {
  const { ops } = useAdminFlowContext();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="到期提醒" description="配置保险/年检提醒规则并查看推送日志。" />
      <ReminderPanel
        rule={ops.reminderRule}
        logsJson={ops.reminderLogsJson}
        onRuleChange={ops.setReminderRule}
        onSaveRule={ops.handleSaveReminderRule}
        onLoadLogs={ops.handleLoadReminderLogs}
      />
    </div>
  );
}
