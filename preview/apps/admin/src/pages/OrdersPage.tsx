import { Link } from "react-router-dom";
import { type Order } from "@rental-preview/shared";
import {
  formatMoney,
  orderStatusLabel,
  serviceModeLabel,
  settlementModeLabel,
  accountTypeLabel
} from "@rental-preview/shared";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { orderBatchActions, orderCrudFields } from "../lib/crud-fields";

const orderFilterFields = [
  { key: "orderNo", label: "订单号", type: "text" as const, placeholder: "ORD" },
  { key: "plateNumber", label: "车牌", type: "text" as const },
  {
    key: "status",
    label: "状态",
    type: "select" as const,
    options: Object.entries(orderStatusLabel).map(([value, label]) => ({ value, label }))
  },
  {
    key: "settlementMode",
    label: "结算",
    type: "select" as const,
    options: [
      { value: "PREPAID", label: "即时支付" },
      { value: "POSTPAID", label: "先用后付" }
    ]
  },
  {
    key: "accountType",
    label: "客户类型",
    type: "select" as const,
    options: [
      { value: "C", label: "C端" },
      { value: "B", label: "B端" },
      { value: "G", label: "G端" }
    ]
  }
];

const financialStatuses = new Set([
  "INVOICE_PENDING",
  "INVOICE_ISSUED",
  "REFUND_PENDING",
  "REFUND_PARTIAL",
  "REFUND_SUCCESS"
]);

export function OrdersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">订单管理</h2>
        <p className="text-sm text-muted-foreground">
          FR-ORD · 履约状态 + 财务延伸状态（发票/退款）· 详情关联用户/车辆/司机
        </p>
      </div>

      <Card>
        <CardContent className="space-y-2 pt-4 text-xs text-muted-foreground">
          <p>
            <strong className="text-foreground">履约：</strong>待支付 → 已确认 → 待提车 → 使用中 → 待结算 → 已结算 → 已完成
          </p>
          <p>
            <strong className="text-foreground">财务（可由发票/退款单据驱动同步）：</strong>
            开票中、已开发票、退款处理中、部分退款、退款成功
          </p>
          <p>
            <strong className="text-foreground">服务方式：</strong>自驾须用户驾照审核通过；包车带司机无需客户驾照（见「用户与认证」）
          </p>
        </CardContent>
      </Card>

      <AdminCrudPanel<Order>
        resource="orders"
        listPath="/api/v1/orders"
        initialFilters={{
          orderNo: "",
          plateNumber: "",
          status: "",
          settlementMode: "",
          accountType: ""
        }}
        filterFields={orderFilterFields}
        formFields={orderCrudFields}
        batchActions={orderBatchActions}
        columns={[
          {
            key: "no",
            header: "订单号",
            render: (r) => (
              <Link
                to={`/orders/${r.id}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {r.orderNo}
              </Link>
            )
          },
          {
            key: "mode",
            header: "服务",
            render: (r) => (
              <Badge variant={r.serviceMode === "WITH_DRIVER" ? "default" : "outline"}>
                {serviceModeLabel[r.serviceMode]}
              </Badge>
            )
          },
          { key: "plate", header: "车辆", render: (r) => r.plateNumber },
          {
            key: "status",
            header: "状态",
            render: (r) => (
              <Badge variant={financialStatuses.has(r.status) ? "warning" : "outline"}>
                {orderStatusLabel[r.status]}
              </Badge>
            )
          },
          {
            key: "acct",
            header: "客户",
            render: (r) => (
              <span className="text-xs">
                {accountTypeLabel[r.accountType]} · {settlementModeLabel[r.settlementMode]}
              </span>
            )
          },
          { key: "fee", header: "费用", render: (r) => formatMoney(r.totalFee) },
          {
            key: "detail",
            header: "操作",
            render: (r) => (
              <Link
                to={`/orders/${r.id}`}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                查看详情
              </Link>
            )
          }
        ]}
      />
    </div>
  );
}
