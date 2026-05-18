import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { QuotaCostPanel } from "../features/panels/QuotaCostPanel";

export function QuotaPage() {
  const { ops } = useAdminFlowContext();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="配额与成本" description="违章查询配额策略与第三方集成成本台账。" />
      <QuotaCostPanel
        quota={ops.quota}
        costMonth={ops.costMonth}
        costs={ops.costRecords}
        onQuotaChange={ops.setQuota}
        onCostMonthChange={ops.setCostMonth}
        onLoadQuota={ops.handleLoadQuota}
        onSaveQuota={ops.handleSaveQuota}
        onLoadCosts={ops.handleLoadCosts}
      />
    </div>
  );
}
