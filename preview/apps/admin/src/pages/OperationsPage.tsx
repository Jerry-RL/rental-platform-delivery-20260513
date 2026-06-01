import type { Coupon, OperatingCostEntry } from "@rental-preview/shared";
import { formatMoney } from "@rental-preview/shared";
import { CollapsibleSection } from "../components/ui/collapsible";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { costCrudFields, couponCrudFields } from "../lib/crud-fields";

export function OperationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">运营台账</h2>
        <p className="text-sm text-muted-foreground">FR-OPS-007/010~015 · 成本 · 优惠券 · 增删改查与批量</p>
      </div>

      <CollapsibleSection title="运营成本台账" description="POST /api/v1/admin/operating-costs" defaultOpen>
        <AdminCrudPanel<OperatingCostEntry>
          resource="operating-costs"
          listPath="/api/v1/admin/operating-costs"
          formFields={costCrudFields}
          batchActions={[{ label: "批量确认", patch: { status: "CONFIRMED" } }]}
          columns={[
            { key: "cat", header: "大类", render: (r) => r.category },
            { key: "sub", header: "子类", render: (r) => r.subCategory },
            { key: "amt", header: "金额", render: (r) => formatMoney(r.amount) },
            { key: "period", header: "期间", render: (r) => r.period },
            { key: "st", header: "状态", render: (r) => r.status },
            { key: "rmk", header: "备注", render: (r) => r.remark ?? "—" }
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="优惠券活动" description="POST /api/v1/admin/coupons" defaultOpen>
        <AdminCrudPanel<Coupon>
          resource="coupons"
          listPath="/api/v1/admin/coupons"
          formFields={couponCrudFields}
          batchActions={[
            { label: "批量启用", patch: { status: "ACTIVE" } },
            { label: "批量停用", patch: { status: "INACTIVE" } }
          ]}
          columns={[
            { key: "code", header: "券码", render: (r) => r.code },
            { key: "name", header: "名称", render: (r) => r.name },
            {
              key: "val",
              header: "优惠",
              render: (r) => (r.discountType === "FIXED" ? formatMoney(r.discountValue) : `${r.discountValue}%`)
            },
            { key: "min", header: "门槛", render: (r) => formatMoney(r.minOrderAmount) },
            { key: "to", header: "有效期", render: (r) => r.validTo }
          ]}
        />
      </CollapsibleSection>
    </div>
  );
}
