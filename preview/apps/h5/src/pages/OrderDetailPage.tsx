import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  api,
  accountTypeLabel,
  canConfirmOrderPickup,
  CONFIRM_SERVICE_START_LABEL,
  feeTypeLabel,
  formatMoney,
  getConfirmPickupDialogMessage,
  getConfirmPickupHint,
  getFulfillmentStepIndex,
  incidentStatusLabel,
  invoiceStatusLabel,
  orderFulfillmentSteps,
  orderStatusLabel,
  paymentChannelLabel,
  paymentStatusLabel,
  refundStatusLabel,
  serviceModeLabel,
  settlementModeLabel,
  ticketStatusLabel,
  violationPaymentStatusLabel,
  vehicleStatusLabel,
  type Order,
  type OrderDetail
} from "@rental-preview/shared";
import { DetailLinkButton } from "../components/DetailLinkButton";
import { OrderQuickActions } from "../components/OrderQuickActions";
import { VehicleImage } from "../components/VehicleImage";

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-2">
    <h3 className="font-medium text-foreground">{title}</h3>
    {children}
  </div>
);

const Line = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right">{value}</span>
  </div>
);

const badgeClass = (tone: "default" | "success" | "warning" | "muted") => {
  if (tone === "success") return "bg-primary/15 text-primary";
  if (tone === "warning") return "bg-warning/15 text-warning";
  return "bg-muted text-muted-foreground";
};

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const res = await api.get<OrderDetail>(`/api/v1/orders/${id}`);
    if (res.ok && res.data) setDetail(res.data);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePay = async () => {
    if (!detail) return;
    const order = detail.order;
    await api.post("/api/v1/payments", {
      orderId: order.id,
      amount: order.totalFee - order.paidAmount,
      channel: "wechat",
      settlementMode: order.settlementMode
    });
    void load();
  };

  const handleReportIncident = () => {
    if (!detail) return;
    navigate(`/orders/${detail.order.id}/report-incident`);
  };

  const handleInvoice = async () => {
    if (!detail) return;
    const order = detail.order;
    await api
      .post("/api/v1/invoices", {
        orderId: order.id,
        titleType: "PERSONAL",
        invoiceTitle: detail.user?.realName || "个人"
      })
      .then(() => load());
  };

  const handleConfirmPickup = async (order: Order) => {
    const res = await api.put<Order>(`/api/v1/orders/${order.id}/pickup`);
    if (res.ok) {
      void load();
      return;
    }
    alert(res.error ?? res.raw?.message ?? "操作失败");
  };

  if (!detail) return <p className="p-4 text-muted-foreground">加载中…</p>;

  const { order, user, pickupStore, returnStore, vehicle, driver, relations } = detail;
  const stepIdx = getFulfillmentStepIndex(order.status);
  const unpaid = Math.max(0, order.totalFee - order.paidAmount);
  const hasIssuedInvoice = detail.invoices.some((i) => i.status === "ISSUED");

  return (
    <div className="space-y-4 p-4 pb-32">
      <button type="button" className="text-sm text-primary" onClick={() => navigate("/orders")}>
        ← 订单列表
      </button>
      <div>
        <h2 className="text-lg font-bold">{order.orderNo}</h2>
        <p className="text-sm text-muted-foreground">{orderStatusLabel[order.status]}</p>
        {detail.statusBadges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {detail.statusBadges.map((b) => (
              <span key={b.key} className={`rounded px-2 py-0.5 text-xs ${badgeClass(b.tone)}`}>
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-1 overflow-x-auto py-2 text-[10px]">
        {orderFulfillmentSteps.map((s, i) => (
          <div
            key={s}
            className={`flex-1 rounded px-1 py-1 text-center ${i <= stepIdx ? "bg-primary/10 font-medium text-primary" : "bg-muted text-muted-foreground"}`}
          >
            {orderStatusLabel[s].slice(0, 3)}
          </div>
        ))}
      </div>

      <Section title="关联信息">
        {user && (
          <Line
            label="用户"
            value={
              <span>
                {user.realName || "—"} · {user.phone}
              </span>
            }
          />
        )}
        {vehicle && (
          <>
            {vehicle.imageUrl && (
              <VehicleImage
                src={vehicle.imageUrl}
                vehicleId={vehicle.id}
                vehicleTypeId={vehicle.vehicleTypeId}
                alt={vehicle.plateNumber}
                className="h-20 w-full rounded-lg"
              />
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">车辆</span>
              <span className="text-right">
                {vehicle.plateNumber} {vehicle.brand} {vehicle.model}
              </span>
            </div>
            <Line label="车辆状态" value={vehicleStatusLabel[vehicle.status]} />
            <div className="flex justify-end">
              <DetailLinkButton to={`/vehicles/${vehicle.id}?from=order`} />
            </div>
          </>
        )}
        {driver ? (
          <>
            <Line label="司机" value={`${driver.name} · ${driver.phone}`} />
            <div className="flex justify-end">
              <DetailLinkButton to={`/drivers/${driver.id}?from=order`} label="司机详情" />
            </div>
          </>
        ) : order.serviceMode === "WITH_DRIVER" ? (
          <Line label="司机" value="待分配" />
        ) : null}
        {relations.vehicleHref && (
          <p className="text-xs text-muted-foreground">车辆 ID：{relations.vehicleId}</p>
        )}
      </Section>

      <Section title="基本信息">
        <Line label="客户" value={accountTypeLabel[order.accountType]} />
        <Line label="结算" value={settlementModeLabel[order.settlementMode]} />
        <Line label="服务" value={serviceModeLabel[order.serviceMode]} />
      </Section>

      {canConfirmOrderPickup(order) && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm">
          <p className="font-medium text-foreground">待开始租车服务</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {getConfirmPickupHint(order.serviceMode)}
          </p>
          <p className="mt-2 text-xs text-primary">请在页面底部点击「{CONFIRM_SERVICE_START_LABEL}」</p>
        </div>
      )}

      <Section title="租期与门店">
        <Line label="取车" value={fmtTime(order.pickupTime)} />
        <Line label="还车" value={fmtTime(order.returnTime)} />
        {pickupStore && <Line label="取车点" value={`${pickupStore.name} · ${pickupStore.address}`} />}
        {returnStore && order.pickupStoreId !== order.returnStoreId && (
          <Line label="还车点" value={`${returnStore.name} · ${returnStore.address}`} />
        )}
      </Section>

      <Section title="费用">
        <Line label="总额" value={formatMoney(order.totalFee)} />
        <Line label="已付" value={formatMoney(order.paidAmount)} />
        {unpaid > 0 && <Line label="待付" value={formatMoney(unpaid)} />}
        {order.feeDetails?.map((f) => (
          <Line
            key={f.id}
            label={feeTypeLabel[f.feeType] ?? f.feeType}
            value={formatMoney(f.amount)}
          />
        ))}
      </Section>

      {detail.payments.length > 0 && (
        <Section title="支付记录">
          {detail.payments.map((p) => (
            <div key={p.id} className="space-y-1 border-t border-border pt-2 first:border-0 first:pt-0">
              <Line label="渠道" value={paymentChannelLabel[p.channel] ?? p.channel} />
              <Line label="金额" value={formatMoney(p.amount)} />
              <Line label="状态" value={paymentStatusLabel[p.status]} />
            </div>
          ))}
        </Section>
      )}

      {detail.refunds.length > 0 && (
        <Section title="退款">
          {detail.refunds.map((r) => (
            <div key={r.id} className="space-y-1">
              <Line label="金额" value={formatMoney(r.amount)} />
              <Line label="状态" value={refundStatusLabel[r.status]} />
              <Line label="原因" value={r.reason} />
            </div>
          ))}
        </Section>
      )}

      {detail.invoices.length > 0 && (
        <Section title="发票">
          {detail.invoices.map((inv) => (
            <div key={inv.id} className="space-y-1 border-t border-border pt-2 first:border-0 first:pt-0">
              <Line label="抬头" value={inv.invoiceTitle} />
              <Line label="金额" value={formatMoney(inv.amount)} />
              <Line label="状态" value={invoiceStatusLabel[inv.status]} />
            </div>
          ))}
        </Section>
      )}

      {detail.violations.length > 0 && (
        <Section title="关联违章">
          {detail.violations.map((v) => (
            <div key={v.id} className="space-y-1 border-t border-border pt-2 first:border-0 first:pt-0">
              <Line label="行为" value={v.behavior ?? v.violationCode} />
              <Line label="时间" value={fmtTime(v.violationTime)} />
              <Line label="罚款" value={formatMoney(v.fineAmount)} />
              <Line label="应付" value={formatMoney(v.totalDue)} />
              <Line label="责任" value={v.responsiblePartyLabel} />
              <Line label="缴款" value={violationPaymentStatusLabel[v.status]} />
              <Line label="追责" value={v.liabilityStatusLabel} />
            </div>
          ))}
          <button
            type="button"
            className="mt-2 text-xs text-primary"
            onClick={() => navigate("/violations")}
          >
            查看全部违章 →
          </button>
        </Section>
      )}

      {detail.order.status === "IN_USE" && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm">
          <p className="font-medium text-warning">自驾用车发生事故？</p>
          <p className="mt-1 text-xs text-muted-foreground">
            请立即上报并保留现场照片；租期违章请至「我的违章」查看。
          </p>
          <button
            type="button"
            className="mt-2 w-full rounded-lg bg-warning py-2 text-xs font-medium text-warning-foreground"
            onClick={handleReportIncident}
          >
            上报租期事故
          </button>
        </div>
      )}

      {(detail.incidents.length > 0 || detail.tickets.length > 0) && (
        <Section title="事故 / 工单">
          {detail.incidents.map((inc) => (
            <div key={inc.id} className="space-y-1 border-t border-border pt-2 first:border-0 first:pt-0">
              <Line label="类型" value={inc.incidentType} />
              <Line label="状态" value={inc.statusLabel} />
              <Line label="责任" value={inc.responsiblePartyLabel} />
              {inc.pauseBilling && <Line label="计费" value="已暂停" />}
              {inc.estimatedCost > 0 && (
                <Line label="预估" value={formatMoney(inc.estimatedCost)} />
              )}
              <Link to={`/incidents/${inc.id}`} className="text-xs text-primary">
                查看详情 →
              </Link>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 text-xs text-primary"
            onClick={() => navigate("/incidents")}
          >
            查看全部事故 →
          </button>
          {detail.tickets.map((t) => (
            <Line key={t.id} label={t.ticketNo} value={ticketStatusLabel[t.status]} />
          ))}
        </Section>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 bar-surface px-4 py-3 safe-bottom">
        {canConfirmOrderPickup(order) ? (
          <button
            type="button"
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99]"
            onClick={() => {
              if (!window.confirm(getConfirmPickupDialogMessage(order.serviceMode))) return;
              void handleConfirmPickup(order);
            }}
          >
            {CONFIRM_SERVICE_START_LABEL}
          </button>
        ) : (
          <>
            <p className="mb-2 text-center text-[10px] text-muted-foreground">快捷操作</p>
            <OrderQuickActions
              order={order}
              unpaid={unpaid}
              hasIssuedInvoice={hasIssuedInvoice}
              hideServiceStart
              onPay={() => void handlePay()}
              onConfirmPickup={() => void handleConfirmPickup(order)}
              onInvoice={() => void handleInvoice()}
              onIncident={handleReportIncident}
            />
          </>
        )}
      </div>
    </div>
  );
}
