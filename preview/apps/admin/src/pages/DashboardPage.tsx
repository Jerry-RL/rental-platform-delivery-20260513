import type { OpsDashboard } from "@rental-preview/shared";
import { formatMoney } from "@rental-preview/shared";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { usePreviewApi } from "../hooks/usePreviewApi";

export function DashboardPage() {
  const { data, loading } = usePreviewApi<OpsDashboard>("/api/v1/admin/dashboard");

  if (loading || !data) return <p className="text-muted-foreground">加载看板数据…</p>;

  const stats = [
    { label: "本月营收", value: formatMoney(data.revenue.month) },
    { label: "本季营收", value: formatMoney(data.revenue.quarter) },
    { label: "本年营收", value: formatMoney(data.revenue.year) },
    { label: "车辆利用率", value: `${(data.utilizationRate * 100).toFixed(1)}%` },
    { label: "进行中订单", value: String(data.activeOrders) },
    { label: "逾期账单", value: String(data.overdueBills) },
    { label: "待结事故", value: String(data.incidentOpen) },
    { label: "本月成本", value: formatMoney(data.costMonth) },
    { label: "毛利率", value: `${(data.grossMargin * 100).toFixed(1)}%` }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">运营看板</h2>
        <p className="text-sm text-muted-foreground">FR-OPS-003/004/007 · 月/季/年营收、利用率、成本与毛利</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>异常预警（演示）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>· 2 笔 B/G 账单逾期（FR-OPS-009）</p>
          <p>· 3 单事故待结案（FR-ORD-012）</p>
          <p>· 1 笔退款待完成 · 1 单待开发票（订单财务状态）</p>
          <p>· 驾照待审用户 13600136000（自驾门禁）</p>
          <p>· 沪D11223 保险已过期（FR-VEH-007）</p>
        </CardContent>
      </Card>
    </div>
  );
}
