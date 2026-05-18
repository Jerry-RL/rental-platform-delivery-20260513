import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { ViolationPanel } from "../features/panels/ViolationPanel";

export function ViolationPage() {
  const { ops } = useAdminFlowContext();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="批量违章" description="按车牌或车辆 ID 批量创建违章查询任务。" />
      <ViolationPanel
        vehiclesText={ops.violationVehiclesText}
        tasks={ops.violationTasks}
        resultJson={ops.violationResultJson}
        onVehiclesTextChange={ops.setViolationVehiclesText}
        onCreateTask={ops.handleCreateViolationTask}
      />
    </div>
  );
}
