import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  api,
  formatMoney,
  RENTAL_COMPANY_CONTACT,
  violationHandleStatusLabel,
  violationPaymentStatusLabel,
  type PageResult,
  type UserViolationSummary,
  type UserViolationView
} from "@rental-preview/shared";
import { SectionCard } from "../components/SectionCard";

export function ViolationsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<UserViolationSummary | null>(null);
  const [items, setItems] = useState<UserViolationView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, list] = await Promise.all([
      api.get<UserViolationSummary>("/api/v1/users/me/violations/summary"),
      api.get<PageResult<UserViolationView>>("/api/v1/users/me/violations?pageSize=50")
    ]);
    if (s.ok && s.data) setSummary(s.data);
    if (list.ok && list.data) setItems(list.data.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4 p-4 pb-8">
      <button type="button" className="text-sm text-primary" onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <div>
        <h1 className="text-lg font-bold">我的违章</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          租期内由承租人承担；包车由平台司机驾驶时由平台先行处理，企业客户按账单结算。
          咨询请致电{" "}
          <a
            href={`tel:${RENTAL_COMPANY_CONTACT.servicePhone.replace(/-/g, "")}`}
            className="text-primary"
          >
            {RENTAL_COMPANY_CONTACT.servicePhone}
          </a>
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="card-surface p-3">
            <p className="text-xs text-muted-foreground">关联记录</p>
            <p className="text-lg font-semibold">{summary.total}</p>
          </div>
          <div className="card-surface p-3">
            <p className="text-xs text-muted-foreground">待缴合计</p>
            <p className="text-lg font-semibold text-warning">
              {formatMoney(summary.totalDueUnpaid)}
            </p>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground">加载中…</p>}

      {!loading && items.length === 0 && (
        <SectionCard title="暂无记录">
          <p className="text-xs text-muted-foreground">
            当前账号下无租期关联违章。批量查询结果由运营处理后会在此展示。
          </p>
        </SectionCard>
      )}

      {items.map((v) => (
        <SectionCard key={v.id} title={v.behavior ?? "交通违法"}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">时间</span>
              <span>{v.violationTime.slice(0, 16).replace("T", " ")}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">车牌</span>
              <span>{v.plateNumber}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">地点</span>
              <span className="text-right">{v.location}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">罚款/扣分</span>
              <span>
                {formatMoney(v.fineAmount)} · {v.points} 分
              </span>
            </div>
            {(v.serviceFee ?? 0) > 0 && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">代办费</span>
                <span>{formatMoney(v.serviceFee ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between gap-2 font-medium">
              <span className="text-muted-foreground">应付合计</span>
              <span>{formatMoney(v.totalDue)}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                {v.serviceContextLabel}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                {v.responsiblePartyLabel}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                {violationPaymentStatusLabel[v.status]}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                {violationHandleStatusLabel[v.handleStatus]}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                {v.liabilityStatusLabel}
              </span>
            </div>
            {v.orderId && (
              <Link
                to={`/orders/${v.orderId}`}
                className="inline-block pt-1 text-xs text-primary"
              >
                查看订单 {v.orderNo} →
              </Link>
            )}
            {v.status === "UNPAID" && v.liabilityStatus !== "WAIVED" && (
              <p className="text-xs leading-relaxed text-warning">
                费用将从押金或后续账单扣除。如有异议请致电租车公司{" "}
                <a
                  href={`tel:${RENTAL_COMPANY_CONTACT.servicePhone.replace(/-/g, "")}`}
                  className="font-medium text-primary"
                >
                  {RENTAL_COMPANY_CONTACT.servicePhone}
                </a>
              </p>
            )}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
