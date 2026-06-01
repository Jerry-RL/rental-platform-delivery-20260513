import { Link } from "react-router-dom";
import { VehicleImage } from "./VehicleImage";
import {
  accountTypeLabel,
  billingModeLabel,
  feeTypeLabel,
  formatMoney,
  getFulfillmentStepIndex,
  invoiceStatusLabel,
  orderFinancialStatuses,
  orderFulfillmentSteps,
  orderStatusLabel,
  paymentChannelLabel,
  paymentStatusLabel,
  pricingRuleStatusLabel,
  refundStatusLabel,
  serviceModeLabel,
  settlementModeLabel,
  ticketStatusLabel,
  violationPaymentStatusLabel,
  timeUnitLabel,
  vehicleStatusLabel,
  type OrderDetail
} from "@rental-preview/shared";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
};

type OrderDetailViewProps = {
  detail: OrderDetail;
  onAdvanceStatus?: () => void;
  advancing?: boolean;
};

const DetailSection = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">{children}</CardContent>
  </Card>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="text-right">{value}</span>
  </div>
);

const badgeVariant = (tone: "default" | "success" | "warning" | "muted") => {
  if (tone === "success") return "default" as const;
  if (tone === "warning") return "warning" as const;
  return "outline" as const;
};

export function OrderDetailView({ detail, onAdvanceStatus, advancing }: OrderDetailViewProps) {
  const { order, user, org, pickupStore, returnStore, vehicle, driver, pricingRule, relations } =
    detail;
  const stepIdx = getFulfillmentStepIndex(order.status);
  const financialActive = orderFinancialStatuses.includes(order.status) || order.status === "INVOICE_PENDING";
  const unpaid = Math.max(0, order.totalFee - order.paidAmount);
  const canAdvance =
    onAdvanceStatus &&
    stepIdx >= 0 &&
    stepIdx < orderFulfillmentSteps.length - 1 &&
    !financialActive;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{order.orderNo}</h2>
          <p className="text-sm text-muted-foreground">订单 ID：{order.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{orderStatusLabel[order.status]}</Badge>
          {detail.statusBadges.map((b) => (
            <Badge key={b.key} variant={badgeVariant(b.tone)}>
              {b.label}
            </Badge>
          ))}
          {canAdvance && (
            <Button type="button" size="sm" disabled={advancing} onClick={onAdvanceStatus}>
              推进下一状态
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">关联信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">下单用户</p>
              {user && relations.userHref ? (
                <>
                  <p className="mt-1 font-medium">{user.realName || "未实名"}</p>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                  <Link to={relations.userHref} className="mt-2 inline-block text-sm text-primary hover:underline">
                    查看用户档案 →
                  </Link>
                </>
              ) : (
                <p className="mt-1 text-muted-foreground">—</p>
              )}
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">车辆</p>
              {vehicle && relations.vehicleHref ? (
                <>
                  {vehicle.imageUrl && (
                    <VehicleImage
                      src={vehicle.imageUrl}
                      vehicleId={vehicle.id}
                      vehicleTypeId={vehicle.vehicleTypeId}
                      alt={vehicle.plateNumber}
                      className="mt-2 h-16 w-full rounded object-cover"
                    />
                  )}
                  <p className="mt-1 font-medium">
                    {vehicle.plateNumber} · {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-xs text-muted-foreground">{vehicleStatusLabel[vehicle.status]}</p>
                  <Link
                    to={relations.vehicleHref}
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    车辆历史详情 →
                  </Link>
                </>
              ) : (
                <p className="mt-1 font-medium">{order.plateNumber}</p>
              )}
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">司机</p>
              {driver && relations.driverHref ? (
                <>
                  <p className="mt-1 font-medium">
                    {driver.name}（{driver.driverNo}）
                  </p>
                  <p className="text-sm text-muted-foreground">{driver.phone}</p>
                  <Link to={relations.driverHref} className="mt-2 inline-block text-sm text-primary hover:underline">
                    司机与人员 →
                  </Link>
                </>
              ) : order.serviceMode === "WITH_DRIVER" ? (
                <p className="mt-1 text-warning">未分配司机</p>
              ) : (
                <p className="mt-1 text-muted-foreground">自驾 · 无司机</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">履约进度</p>
            <div className="flex flex-wrap gap-1">
              {orderFulfillmentSteps.map((s, i) => (
                <div
                  key={s}
                  className={`rounded px-2 py-1 text-xs ${i <= stepIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {orderStatusLabel[s]}
                </div>
              ))}
            </div>
          </div>
          {financialActive && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">财务状态</p>
              <Badge variant="outline">{orderStatusLabel[order.status]}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailSection title="基本信息">
          <Row label="客户类型" value={accountTypeLabel[order.accountType]} />
          <Row label="结算方式" value={settlementModeLabel[order.settlementMode]} />
          <Row label="服务方式" value={serviceModeLabel[order.serviceMode]} />
          {order.billingPeriod && <Row label="账期" value={order.billingPeriod} />}
          {org && (
            <Row
              label="企业账户"
              value={
                <Link to={`/orgs/customers?highlight=${org.id}`} className="text-primary hover:underline">
                  {org.orgName}
                </Link>
              }
            />
          )}
        </DetailSection>

        <DetailSection title="租期与门店">
          <Row label="取车时间" value={fmtTime(order.pickupTime)} />
          <Row label="还车时间" value={fmtTime(order.returnTime)} />
          <div className="border-t border-border" />
          <Row
            label="取车门店"
            value={
              pickupStore ? `${pickupStore.name}（${pickupStore.city}）` : order.pickupStoreId
            }
          />
          {pickupStore && <p className="text-xs text-muted-foreground">{pickupStore.address}</p>}
          <Row
            label="还车门店"
            value={
              returnStore ? `${returnStore.name}（${returnStore.city}）` : order.returnStoreId
            }
          />
          {returnStore && order.pickupStoreId !== order.returnStoreId && (
            <p className="text-xs text-muted-foreground">{returnStore.address}</p>
          )}
        </DetailSection>
      </div>

      <DetailSection title="费用明细">
        <Row label="预估费用" value={formatMoney(order.estimatedFee)} />
        <Row label="订单总额" value={formatMoney(order.totalFee)} />
        <Row label="已付金额" value={formatMoney(order.paidAmount)} />
        {unpaid > 0 && (
          <Row label="待付" value={<span className="font-medium text-warning">{formatMoney(unpaid)}</span>} />
        )}
        <div className="border-t border-border" />
        {order.feeDetails?.map((f) => (
          <Row
            key={f.id}
            label={feeTypeLabel[f.feeType] ?? f.feeType}
            value={
              <span>
                {formatMoney(f.amount)}
                {f.remark ? <span className="ml-1 text-xs text-muted-foreground">({f.remark})</span> : null}
              </span>
            }
          />
        ))}
      </DetailSection>

      {pricingRule && (
        <DetailSection title="定价快照">
          <Row label="规则名称" value={pricingRule.name} />
          <Row label="计费模式" value={billingModeLabel[pricingRule.billingMode]} />
          <Row label="时间单位" value={timeUnitLabel[pricingRule.timeUnit]} />
          <Row label="基础价" value={formatMoney(pricingRule.basePrice)} />
          <Row label="含公里" value={`${pricingRule.includedKm} km`} />
          <Row label="超公里单价" value={formatMoney(pricingRule.overKmPrice)} />
          <Row label="状态" value={pricingRuleStatusLabel[pricingRule.status]} />
        </DetailSection>
      )}

      {(detail.payments.length > 0 || detail.refunds.length > 0) && (
        <DetailSection title="支付与退款">
          {detail.payments.map((p) => (
            <div key={p.id} className="rounded-md border border-border p-2">
              <Row label="渠道" value={paymentChannelLabel[p.channel] ?? p.channel} />
              <Row label="金额" value={formatMoney(p.amount)} />
              <Row label="状态" value={paymentStatusLabel[p.status]} />
              {p.channelTxnNo && <Row label="流水号" value={p.channelTxnNo} />}
              <Row label="时间" value={fmtTime(p.createdAt)} />
            </div>
          ))}
          {detail.refunds.map((r) => (
            <div key={r.id} className="rounded-md border border-dashed border-border p-2">
              <Row label="退款" value={formatMoney(r.amount)} />
              <Row label="原因" value={r.reason} />
              <Row label="状态" value={refundStatusLabel[r.status]} />
            </div>
          ))}
        </DetailSection>
      )}

      {detail.violations.length > 0 && (
        <DetailSection title="关联违章">
          {detail.violations.map((v) => (
            <div key={v.id} className="rounded-md border border-border p-2">
              <Row label="行为" value={v.behavior ?? v.violationCode} />
              <Row label="时间" value={fmtTime(v.violationTime)} />
              <Row label="罚款/扣分" value={`${formatMoney(v.fineAmount)} · ${v.points} 分`} />
              <Row label="应付" value={formatMoney(v.totalDue)} />
              <Row label="责任方" value={v.responsiblePartyLabel} />
              <Row label="场景" value={v.serviceContextLabel} />
              <Row label="缴款" value={violationPaymentStatusLabel[v.status]} />
              <Row label="追责状态" value={v.liabilityStatusLabel} />
            </div>
          ))}
        </DetailSection>
      )}

      {(detail.incidents.length > 0 || detail.tickets.length > 0) && (
        <DetailSection title="租期事故与工单">
          {detail.incidents.map((inc) => (
            <div key={inc.id} className="rounded-md border border-warning/40 bg-warning/5 p-2">
              <Row label="类型" value={inc.incidentType} />
              <Row label="状态" value={inc.statusLabel} />
              <Row label="责任" value={inc.responsiblePartyLabel} />
              <Row label="场景" value={inc.serviceContextLabel} />
              <Row label="地点" value={inc.location} />
              {inc.estimatedCost > 0 && (
                <Row label="预估费用" value={formatMoney(inc.estimatedCost)} />
              )}
              {inc.pauseBilling && <Badge variant="warning">暂停计费</Badge>}
              <Link
                to={`/incidents/${inc.id}`}
                className="mt-1 inline-block text-xs text-primary hover:underline"
              >
                查看事故详情 →
              </Link>
            </div>
          ))}
          {detail.tickets.map((t) => (
            <div key={t.id} className="rounded-md border border-border p-2">
              <Row label="工单" value={t.ticketNo} />
              <Row label="主题" value={t.subject} />
              <Row label="状态" value={ticketStatusLabel[t.status]} />
            </div>
          ))}
        </DetailSection>
      )}

      {detail.invoices.length > 0 && (
        <DetailSection title="发票">
          {detail.invoices.map((inv) => (
            <div key={inv.id} className="rounded-md border border-border p-2">
              <Row label="抬头" value={inv.invoiceTitle} />
              <Row label="金额" value={formatMoney(inv.amount)} />
              <Row label="状态" value={invoiceStatusLabel[inv.status]} />
              {inv.invoiceNo && <Row label="发票号" value={inv.invoiceNo} />}
            </div>
          ))}
        </DetailSection>
      )}
    </div>
  );
}
