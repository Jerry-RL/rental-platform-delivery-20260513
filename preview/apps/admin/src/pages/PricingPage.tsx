import type { PricingRule } from "@rental-preview/shared";
import {
  accountTypeLabel,
  billingModeLabel,
  formatMoney,
  pricingRuleStatusLabel,
  serviceModeLabel,
  timeUnitLabel
} from "@rental-preview/shared";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { Badge } from "../components/ui/badge";
import { CollapsibleSection } from "../components/ui/collapsible";
import { pricingBatchActions, pricingCrudFields } from "../lib/crud-fields";

const pricingFilterFields = [
  { key: "name", label: "规则名称", type: "text" as const, placeholder: "日租" },
  {
    key: "billingMode",
    label: "计费模式",
    type: "select" as const,
    options: [
      { value: "TIME", label: "按时间" },
      { value: "MILEAGE", label: "按里程" },
      { value: "HYBRID", label: "时间+里程" }
    ]
  },
  {
    key: "serviceMode",
    label: "服务方式",
    type: "select" as const,
    options: [
      { value: "SELF_DRIVE", label: "自驾" },
      { value: "WITH_DRIVER", label: "包车带司机" },
      { value: "MIXED", label: "部分带司机+自驾" }
    ]
  },
  {
    key: "accountType",
    label: "客户类型",
    type: "select" as const,
    options: [
      { value: "C", label: "C端" },
      { value: "B", label: "B端" },
      { value: "G", label: "G端" },
      { value: "ALL", label: "全部" }
    ]
  },
  {
    key: "status",
    label: "状态",
    type: "select" as const,
    options: [
      { value: "ACTIVE", label: "生效中" },
      { value: "INACTIVE", label: "已停用" }
    ]
  }
];

const dimensions = [
  { title: "计费模式", desc: "TIME / MILEAGE / HYBRID", fr: "§3.1" },
  { title: "时间粒度", desc: "小时 / 天 / 周 / 月", fr: "§3.2" },
  { title: "服务类型", desc: "自驾 / 包车 / 部分带司机+自驾", fr: "BR-016" },
  { title: "车型/客户", desc: "vehicle_type · C/B/G 协议价", fr: "§2" },
  { title: "匹配优先级", desc: "数值越大越优先命中", fr: "引擎" }
];

export function PricingPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">定价策略管理</h2>
        <p className="text-sm text-muted-foreground">
          FR-OPS-001 · 对齐《订单定价策略说明》· GET /api/v1/admin/pricing-rules · 下单估价 POST /orders/quote
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {dimensions.map((d) => (
          <div key={d.title} className="rounded-lg border border-border bg-card p-3 text-sm">
            <p className="font-medium">{d.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{d.desc}</p>
            <p className="mt-1 text-[10px] text-primary">{d.fr}</p>
          </div>
        ))}
      </div>

      <CollapsibleSection
        title="价格规则库"
        description="POST/PUT/DELETE /api/v1/admin/pricing-rules · 批量启用/停用"
        defaultOpen
      >
        <AdminCrudPanel<PricingRule>
          resource="pricing-rules"
          listPath="/api/v1/admin/pricing-rules"
          initialFilters={{
            name: "",
            billingMode: "",
            serviceMode: "",
            accountType: "",
            status: ""
          }}
          filterFields={pricingFilterFields}
          formFields={pricingCrudFields}
          batchActions={pricingBatchActions}
          columns={[
            { key: "name", header: "规则名称", render: (r) => r.name },
            {
              key: "mode",
              header: "计费",
              render: (r) => (
                <span>
                  {billingModeLabel[r.billingMode]} / {timeUnitLabel[r.timeUnit]}
                </span>
              )
            },
            { key: "svc", header: "服务", render: (r) => serviceModeLabel[r.serviceMode] },
            {
              key: "scope",
              header: "适用范围",
              render: (r) => (
                <span className="text-xs">
                  {r.accountType ? accountTypeLabel[r.accountType] : "—"}
                  {r.vehicleTypeId ? ` · ${r.vehicleTypeId}` : ""}
                </span>
              )
            },
            {
              key: "base",
              header: "基价",
              render: (r) => (r.billingMode === "MILEAGE" ? `¥${r.basePrice}/km` : formatMoney(r.basePrice))
            },
            { key: "pri", header: "优先级", render: (r) => String(r.priority) },
            {
              key: "st",
              header: "状态",
              render: (r) => (
                <Badge variant={r.status === "ACTIVE" ? "success" : "outline"}>
                  {pricingRuleStatusLabel[r.status]}
                </Badge>
              )
            }
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="计价引擎说明（演示）"
        description="与 H5 下单页、packages/shared/pricing.ts 一致"
        defaultOpen={false}
      >
        <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">匹配顺序：</strong>按 serviceMode + billingMode 取 ACTIVE 规则 → 优先级最高者 →
            结合车辆日租基价、租期、门店异还、批量折扣、优惠券试算。
          </p>
          <p>
            <strong className="text-foreground">HYBRID：</strong>租金 = 时间价 + max(0, 预估里程 − 含公里) × 超公里单价。
          </p>
          <p>
            <strong className="text-foreground">MILEAGE：</strong>租金 = 每公里单价 × 预估里程（规则 prc-006）。
          </p>
          <p>
            <strong className="text-foreground">WITH_DRIVER：</strong>叠加司机/包车费用，不校验驾照；SELF_DRIVE 须通过 /eligibility。
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}
