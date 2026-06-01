import { useEffect, useState } from "react";
import { api, billStatusLabel, formatMoney, getPreviewUserId, IDS, type Bill, type PageResult } from "@rental-preview/shared";

export function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const userId = getPreviewUserId();
  const orgId = userId === IDS.userG ? IDS.orgG : userId === IDS.userB ? IDS.orgB : null;

  useEffect(() => {
    if (!orgId) return;
    void (async () => {
      const res = await api.get<PageResult<Bill>>(`/api/v1/bills?billingAccountId=${orgId}`);
      if (res.ok && res.data) setBills(res.data.items);
    })();
  }, [orgId]);

  if (!orgId) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        <p>C 端用户使用即时支付，无月结账单。</p>
        <p className="mt-2">请切换 B/G 演示账号查看账单流程。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold">企业账单</h2>
      <p className="text-xs text-muted-foreground">账单确认 → 对公支付 → 流水匹配 → 开票</p>
      {bills.map((b) => (
        <div key={b.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between">
            <span className="font-medium">{b.billNo}</span>
            <span className="text-xs text-primary">{billStatusLabel[b.status]}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">账期 {b.billingPeriod}</p>
          <p className="mt-2 text-lg font-bold text-primary">
            {formatMoney(b.paidAmount)} / {formatMoney(b.totalAmount)}
          </p>
          <p className="mt-2 rounded bg-muted/50 p-2 text-xs">
            付款附言：{b.paymentReferenceCode}
          </p>
          {b.status === "PENDING_CONFIRM" && (
            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-primary py-2 text-sm text-primary-foreground"
              onClick={() =>
                void api.put(`/api/v1/bills/${b.id}/confirm`, { confirmedBy: userId }).then(() => location.reload())
              }
            >
              确认账单
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
