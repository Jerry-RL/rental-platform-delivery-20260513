import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  api,
  formatMoney,
  RENTAL_COMPANY_CONTACT,
  type PageResult,
  type UserIncidentSummary,
  type UserIncidentView
} from "@rental-preview/shared";
import { SectionCard } from "../components/SectionCard";

export function IncidentsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<UserIncidentSummary | null>(null);
  const [items, setItems] = useState<UserIncidentView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, list] = await Promise.all([
      api.get<UserIncidentSummary>("/api/v1/users/me/incidents/summary"),
      api.get<PageResult<UserIncidentView>>("/api/v1/users/me/incidents?pageSize=20")
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
        <h1 className="text-lg font-bold">我的事故</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          自驾租期事故须及时上报；处理中订单将标记待结事故费（BR-031）
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          紧急致电{" "}
          <a
            href={`tel:${RENTAL_COMPANY_CONTACT.servicePhone.replace(/-/g, "")}`}
            className="text-primary"
          >
            {RENTAL_COMPANY_CONTACT.servicePhone}
          </a>
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="card-surface p-2">
            <p className="text-muted-foreground">记录</p>
            <p className="text-lg font-semibold">{summary.total}</p>
          </div>
          <div className="card-surface p-2">
            <p className="text-muted-foreground">处理中</p>
            <p className="text-lg font-semibold text-warning">{summary.open}</p>
          </div>
          <div className="card-surface p-2">
            <p className="text-muted-foreground">暂停计费</p>
            <p className="text-lg font-semibold">{summary.pauseBillingCount}</p>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground">加载中…</p>}

      {!loading && items.length === 0 && (
        <SectionCard title="暂无事故记录">
          <p className="text-xs text-muted-foreground">
            使用中订单可在订单详情点击「上报事故」。
          </p>
        </SectionCard>
      )}

      {items.map((inc) => (
        <SectionCard key={inc.id} title={`${inc.incidentType} · ${inc.statusLabel}`}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">订单</span>
              <Link to={`/orders/${inc.orderId}`} className="text-primary">
                {inc.orderNo}
              </Link>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">车牌</span>
              <span>{inc.plateNumber}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">场景</span>
              <span>{inc.serviceContextLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">责任</span>
              <span>{inc.responsiblePartyLabel}</span>
            </div>
            {inc.estimatedCost > 0 && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">预估费用</span>
                <span>{formatMoney(inc.estimatedCost)}</span>
              </div>
            )}
            {inc.pauseBilling && (
              <p className="text-xs text-warning">已申请暂停计费，还车前需运营确认（FR-ORD-010）</p>
            )}
            {inc.description && (
              <p className="text-xs text-muted-foreground">{inc.description}</p>
            )}
            <Link
              to={`/incidents/${inc.id}`}
              className="mt-2 inline-block text-sm font-medium text-primary"
            >
              查看详情 →
            </Link>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
