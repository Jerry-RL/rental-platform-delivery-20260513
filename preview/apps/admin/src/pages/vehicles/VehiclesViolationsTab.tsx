import { useCallback, useEffect, useMemo, useState } from "react";
import {
  api,
  formatMoney,
  previewStore,
  violationBatchScopeLabel,
  violationHandleStatusLabel,
  violationPaymentStatusLabel,
  violationTaskStatusLabel,
  type UserViolationView,
  type CreateViolationBatchRequest,
  type PageResult,
  type ViolationBatchTask,
  type ViolationQuota,
  type ViolationSummary
} from "@rental-preview/shared";
import { AlertTriangle, ClipboardCheck, RefreshCw } from "lucide-react";
import { ListFilterForm } from "../../components/shared/ListFilterForm";
import { DataTable } from "../../components/shared/DataTable";
import { buildQueryPath } from "../../lib/query";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";

type BatchFormState = {
  allFleet: boolean;
  city: string;
  vehicleStatus: string;
  dateFrom: string;
  dateTo: string;
  recentDaysOnly: boolean;
  recentDays: string;
};

const defaultBatch: BatchFormState = {
  allFleet: true,
  city: "",
  vehicleStatus: "",
  dateFrom: "2026-05-01",
  dateTo: "2026-06-01",
  recentDaysOnly: true,
  recentDays: "30"
};

const violationListFilters = {
  plateNumber: "",
  dateFrom: "2026-05-01",
  dateTo: "2026-06-01",
  recentDays: "",
  handleStatus: "",
  paymentStatus: ""
};

export function VehiclesViolationsTab() {
  const fleetTotal = previewStore.vehicles.length;
  const [batch, setBatch] = useState(defaultBatch);
  const [quota, setQuota] = useState<ViolationQuota | null>(null);
  const [summary, setSummary] = useState<ViolationSummary | null>(null);
  const [violationTasks, setViolationTasks] = useState<ViolationBatchTask[]>([]);
  const [violations, setViolations] = useState<UserViolationView[]>([]);
  const [listFilters, setListFilters] = useState(violationListFilters);
  const [batchMsg, setBatchMsg] = useState("");
  const [detectMsg, setDetectMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previewCount = useMemo(() => {
    let list = previewStore.vehicles;
    if (!batch.allFleet) {
      if (batch.city) list = list.filter((v) => v.city === batch.city);
      if (batch.vehicleStatus) list = list.filter((v) => v.status === batch.vehicleStatus);
    }
    return list.length;
  }, [batch.allFleet, batch.city, batch.vehicleStatus]);

  const previewCost = useMemo(
    () => (quota?.unitCost ?? 0.06) * previewCount,
    [previewCount, quota?.unitCost]
  );

  const loadQuotaAndTasks = async () => {
    const [t, q] = await Promise.all([
      api.get<PageResult<ViolationBatchTask>>("/api/v1/admin/violation-tasks?pageSize=30"),
      api.get<ViolationQuota>("/api/v1/admin/violation-quota")
    ]);
    if (t.ok && t.data) setViolationTasks(t.data.items);
    if (q.ok && q.data) setQuota(q.data);
  };

  const loadSummary = useCallback(async (filters: Record<string, string>) => {
    const path = buildQueryPath("/api/v1/admin/violations/summary", filters);
    const res = await api.get<ViolationSummary>(path);
    if (res.ok && res.data) setSummary(res.data);
  }, []);

  const loadViolations = useCallback(async (filters: Record<string, string>) => {
    const path = buildQueryPath("/api/v1/admin/violations", { ...filters, pageSize: "80" });
    const res = await api.get<PageResult<UserViolationView>>(path);
    if (res.ok && res.data) setViolations(res.data.items);
  }, []);

  const reloadList = useCallback(
    async (filters: Record<string, string>) => {
      await Promise.all([loadSummary(filters), loadViolations(filters)]);
    },
    [loadSummary, loadViolations]
  );

  useEffect(() => {
    void loadQuotaAndTasks();
    void reloadList(listFilters);
  }, []);

  const setBatchField = <K extends keyof BatchFormState>(key: K, value: BatchFormState[K]) => {
    setBatch((p) => ({ ...p, [key]: value }));
  };

  const handleBatchViolation = async () => {
    setSubmitting(true);
    setBatchMsg("");
    const payload: CreateViolationBatchRequest = {
      allFleet: batch.allFleet,
      city: batch.city || undefined,
      vehicleStatus: batch.vehicleStatus || undefined,
      dateFrom: batch.dateFrom || undefined,
      dateTo: batch.dateTo || undefined,
      recentDaysOnly: batch.recentDaysOnly,
      recentDays: Number(batch.recentDays) || 30
    };
    const res = await api.post<ViolationBatchTask>("/api/v1/admin/violation-tasks", payload);
    setSubmitting(false);
    setBatchMsg(res.ok ? res.raw?.message ?? "已提交" : res.error ?? "提交失败");
    void loadQuotaAndTasks();
    void reloadList(listFilters);
  };

  const handleDetectHandle = async () => {
    const res = await api.post<{ updated: number }>("/api/v1/admin/violations/detect-handle-status", {});
    setDetectMsg(res.ok ? res.raw?.message ?? "检测完成" : res.error ?? "检测失败");
    void reloadList(listFilters);
  };

  const handleListSearch = () => void reloadList(listFilters);

  const handleListReset = () => {
    setListFilters(violationListFilters);
    void reloadList(violationListFilters);
  };

  const handleRecentPreset = (days: string) => {
    const next = { ...listFilters, recentDays: days, dateFrom: "", dateTo: "" };
    setListFilters(next);
    void reloadList(next);
  };

  const handleBadge = (status: UserViolationView["handleStatus"]) => {
    const map = {
      UNPROCESSED: "warning" as const,
      IN_PROGRESS: "secondary" as const,
      PROCESSED: "success" as const,
      WAIVED: "outline" as const
    };
    return <Badge variant={map[status]}>{violationHandleStatusLabel[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        数脉 SHUMAI · 全车队批量查询 · 按时间段过滤 · 近期优先 · 处理状态检测（FR-EXT-001~003）
        {quota && (
          <Badge variant="outline" className="ml-2">
            配额 {quota.usedCount}/{quota.totalQuota} 次 · 单价 {formatMoney(quota.unitCost)}
          </Badge>
        )}
      </p>

      {summary && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {[
            { label: "违章总数", value: summary.total, variant: "secondary" as const },
            { label: "近30天", value: summary.recentCount, variant: "outline" as const },
            { label: "未处理", value: summary.unprocessed, variant: "warning" as const },
            { label: "处理中", value: summary.inProgress, variant: "secondary" as const },
            { label: "已处理", value: summary.processed, variant: "success" as const },
            { label: "未缴款", value: summary.unpaid, variant: "warning" as const },
            { label: "已缴款", value: summary.paid, variant: "success" as const }
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-card px-3 py-2 text-center"
            >
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-lg font-semibold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 text-warning" />
          批量违章查询（车辆全表）
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={batch.allFleet ? "default" : "outline"}
            onClick={() => setBatchField("allFleet", true)}
          >
            全车队 ({fleetTotal} 台)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={!batch.allFleet ? "default" : "outline"}
            onClick={() => setBatchField("allFleet", false)}
          >
            按条件筛选
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>城市</Label>
            <Select
              value={batch.city}
              onChange={(e) => setBatchField("city", e.target.value)}
              disabled={batch.allFleet}
              placeholder="全部城市"
              options={["上海", "北京", "广州", "深圳", "杭州", "成都"].map((c) => ({
                value: c,
                label: c
              }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>车辆状态</Label>
            <Select
              value={batch.vehicleStatus}
              onChange={(e) => setBatchField("vehicleStatus", e.target.value)}
              disabled={batch.allFleet}
              placeholder="全部状态"
              options={[
                { value: "AVAILABLE", label: "可用" },
                { value: "IN_USE", label: "已租出" },
                { value: "MAINTENANCE", label: "维修中" },
                { value: "RETIRED", label: "报废" }
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="batch-from">违章时间起</Label>
            <Input
              id="batch-from"
              type="date"
              value={batch.dateFrom}
              onChange={(e) => setBatchField("dateFrom", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="batch-to">违章时间止</Label>
            <Input
              id="batch-to"
              type="date"
              value={batch.dateTo}
              onChange={(e) => setBatchField("dateTo", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={batch.recentDaysOnly}
              onChange={(e) => setBatchField("recentDaysOnly", e.target.checked)}
              className="rounded border-input"
            />
            <span>仅查近期违章（优先）</span>
          </label>
          {batch.recentDaysOnly && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">近</Label>
              <Select
                wrapperClassName="w-24"
                value={batch.recentDays}
                onChange={(e) => setBatchField("recentDays", e.target.value)}
                options={[
                  { value: "7", label: "7 天" },
                  { value: "30", label: "30 天" },
                  { value: "90", label: "90 天" }
                ]}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            预计查询 <strong className="text-foreground">{previewCount}</strong> 台 · 费用{" "}
            <strong className="text-primary">{formatMoney(previewCost)}</strong>
          </span>
          <Button type="button" size="sm" disabled={submitting} onClick={() => void handleBatchViolation()}>
            {submitting ? "提交中…" : "提交全表查询"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => void handleDetectHandle()}>
            <ClipboardCheck className="mr-1 h-4 w-4" />
            检测处理状态
          </Button>
          {batchMsg && <span className="text-primary">{batchMsg}</span>}
          {detectMsg && <span className="text-muted-foreground">{detectMsg}</span>}
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">批量任务记录</h3>
          <Button type="button" size="sm" variant="ghost" onClick={() => void loadQuotaAndTasks()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <DataTable
          rows={violationTasks}
          columns={[
            { key: "no", header: "任务号", render: (r) => r.taskNo },
            { key: "scope", header: "范围", render: (r) => violationBatchScopeLabel[r.scope] },
            { key: "cnt", header: "车辆数", render: (r) => String(r.vehicleIds.length) },
            {
              key: "range",
              header: "查询时段",
              render: (r) => (
                <span className="text-xs">
                  {r.dateFrom}～{r.dateTo}
                  {r.recentDaysOnly && (
                    <Badge variant="outline" className="ml-1 text-[10px]">
                      近{r.recentDays ?? 30}天
                    </Badge>
                  )}
                </span>
              )
            },
            {
              key: "status",
              header: "状态",
              render: (r) => (
                <Badge variant={r.status === "COMPLETED" ? "success" : r.status === "FAILED" ? "warning" : "secondary"}>
                  {violationTaskStatusLabel[r.status]}
                </Badge>
              )
            },
            {
              key: "result",
              header: "结果摘要",
              render: (r) =>
                r.resultSummary ? (
                  <span className="text-xs text-muted-foreground">
                    新增{r.resultSummary.newViolations} · 待处理{r.resultSummary.unprocessedCount}
                  </span>
                ) : (
                  "—"
                )
            },
            { key: "cost", header: "费用", render: (r) => formatMoney(r.totalCost) }
          ]}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium">违章明细</h3>
          <span className="text-xs text-muted-foreground">（按违章时间倒序，近期优先）</span>
          <div className="flex gap-1">
            {[
              { days: "7", label: "近7天" },
              { days: "30", label: "近30天" },
              { days: "90", label: "近90天" }
            ].map((p) => (
              <Button
                key={p.days}
                type="button"
                size="sm"
                variant={listFilters.recentDays === p.days ? "default" : "outline"}
                onClick={() => handleRecentPreset(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <ListFilterForm
          fields={[
            { key: "plateNumber", label: "车牌", type: "text", placeholder: "沪A" },
            { key: "dateFrom", label: "违章起", type: "text", placeholder: "2026-05-01" },
            { key: "dateTo", label: "违章止", type: "text", placeholder: "2026-06-01" },
            {
              key: "handleStatus",
              label: "处理状态",
              type: "select",
              options: Object.entries(violationHandleStatusLabel).map(([value, label]) => ({
                value,
                label
              }))
            },
            {
              key: "paymentStatus",
              label: "缴款状态",
              type: "select",
              options: Object.entries(violationPaymentStatusLabel).map(([value, label]) => ({
                value,
                label
              }))
            }
          ]}
          values={listFilters}
          onChange={(k, v) => setListFilters((p) => ({ ...p, [k]: v }))}
          onSearch={handleListSearch}
          onReset={handleListReset}
        />

        <DataTable
          rows={violations}
          columns={[
            { key: "plate", header: "车牌", render: (r) => r.plateNumber },
            {
              key: "order",
              header: "订单",
              render: (r) => r.orderNo ?? (r.orderId ? "已关联" : "—")
            },
            {
              key: "party",
              header: "责任方",
              render: (r) => r.responsiblePartyLabel
            },
            {
              key: "ctx",
              header: "场景",
              render: (r) => r.serviceContextLabel
            },
            {
              key: "liability",
              header: "追责",
              render: (r) => r.liabilityStatusLabel
            },
            { key: "time", header: "违章时间", render: (r) => r.violationTime.slice(0, 16).replace("T", " ") },
            { key: "code", header: "代码", render: (r) => r.violationCode ?? "—" },
            { key: "loc", header: "地点", render: (r) => r.location },
            { key: "fine", header: "罚款", render: (r) => formatMoney(r.fineAmount) },
            { key: "pts", header: "扣分", render: (r) => String(r.points) },
            {
              key: "pay",
              header: "缴款",
              render: (r) => (
                <Badge variant={r.status === "UNPAID" ? "warning" : "success"}>
                  {violationPaymentStatusLabel[r.status]}
                </Badge>
              )
            },
            { key: "handle", header: "处理", render: (r) => handleBadge(r.handleStatus) },
            {
              key: "proc",
              header: "处理人/时间",
              render: (r) =>
                r.processedAt ? (
                  <span className="text-xs text-muted-foreground">
                    {r.processedBy ?? "—"}
                    <br />
                    {r.processedAt.slice(0, 10)}
                  </span>
                ) : (
                  "—"
                )
            }
          ]}
        />
      </div>
    </div>
  );
}
