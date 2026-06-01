import type { PreviewStore } from "./store";
import type {
  CreateViolationBatchRequest,
  Vehicle,
  ViolationBatchResultSummary,
  ViolationBatchTask,
  ViolationHandleStatus,
  ViolationRecord,
  ViolationSummary
} from "./types";

const PREVIEW_NOW = new Date("2026-06-01T12:00:00.000Z");

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export const normalizeViolation = (v: ViolationRecord): ViolationRecord => {
  if (v.handleStatus) return v;
  const handleStatus: ViolationHandleStatus =
    v.status === "PAID" ? "PROCESSED" : "UNPROCESSED";
  return { ...v, handleStatus };
};

export const inferHandleStatus = (v: ViolationRecord): ViolationHandleStatus => {
  if (v.handleStatus === "WAIVED" || v.remark?.includes("申诉")) return "WAIVED";
  if (v.handleStatus === "PROCESSED" || v.status === "PAID") return "PROCESSED";
  if (v.handleStatus === "IN_PROGRESS" || v.processedAt) return "IN_PROGRESS";
  return "UNPROCESSED";
};

export const resolveBatchVehicles = (
  store: PreviewStore,
  req: CreateViolationBatchRequest
): Vehicle[] => {
  if (req.vehicleIds?.length && !req.allFleet) {
    const set = new Set(req.vehicleIds);
    return store.vehicles.filter((v) => set.has(v.id));
  }
  let list = [...store.vehicles];
  if (req.city) list = list.filter((v) => v.city === req.city);
  if (req.vehicleStatus) list = list.filter((v) => v.status === req.vehicleStatus);
  return list;
};

export const resolveQueryDateRange = (req: CreateViolationBatchRequest) => {
  const to = req.dateTo ? new Date(`${req.dateTo}T23:59:59.000Z`) : PREVIEW_NOW;
  const recentDays = req.recentDays ?? 30;
  const from = req.dateFrom
    ? new Date(`${req.dateFrom}T00:00:00.000Z`)
    : req.recentDaysOnly
      ? new Date(to.getTime() - recentDays * 86400000)
      : new Date(to.getTime() - 365 * 86400000);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    recentDaysOnly: Boolean(req.recentDaysOnly),
    recentDays
  };
};

const inRange = (iso: string, from: string, to: string) => {
  const t = new Date(iso).getTime();
  return t >= new Date(from).getTime() && t <= new Date(to).getTime();
};

export type ViolationListQuery = {
  plateNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  recentDays?: string;
  handleStatus?: string;
  paymentStatus?: string;
  vehicleId?: string;
};

export const filterViolations = (
  violations: ViolationRecord[],
  q: ViolationListQuery
): ViolationRecord[] => {
  let items = violations.map(normalizeViolation).map((v) => ({
    ...v,
    handleStatus: inferHandleStatus(v)
  }));

  const to = q.dateTo ? `${q.dateTo}T23:59:59.000Z` : PREVIEW_NOW.toISOString();
  let from = q.dateFrom ? `${q.dateFrom}T00:00:00.000Z` : "";
  if (q.recentDays) {
    const days = Number(q.recentDays) || 30;
    from = new Date(PREVIEW_NOW.getTime() - days * 86400000).toISOString();
  }
  if (from) items = items.filter((v) => inRange(v.violationTime, from, to));

  if (q.plateNumber) items = items.filter((v) => v.plateNumber.includes(q.plateNumber!));
  if (q.handleStatus) items = items.filter((v) => v.handleStatus === q.handleStatus);
  if (q.paymentStatus) items = items.filter((v) => v.status === q.paymentStatus);
  if (q.vehicleId) items = items.filter((v) => v.vehicleId === q.vehicleId);

  items.sort((a, b) => b.violationTime.localeCompare(a.violationTime));
  return items;
};

export const buildViolationSummary = (
  violations: ViolationRecord[],
  q: ViolationListQuery
): ViolationSummary => {
  const items = filterViolations(violations, q);
  const recentCutoff = new Date(PREVIEW_NOW.getTime() - 30 * 86400000).toISOString();
  return {
    total: items.length,
    unpaid: items.filter((v) => v.status === "UNPAID").length,
    paid: items.filter((v) => v.status === "PAID").length,
    unprocessed: items.filter((v) => v.handleStatus === "UNPROCESSED").length,
    inProgress: items.filter((v) => v.handleStatus === "IN_PROGRESS").length,
    processed: items.filter((v) => v.handleStatus === "PROCESSED").length,
    waived: items.filter((v) => v.handleStatus === "WAIVED").length,
    recentCount: items.filter((v) => v.violationTime >= recentCutoff).length,
    dateFrom: q.dateFrom ?? (q.recentDays ? undefined : undefined),
    dateTo: q.dateTo
  };
};

const VIOLATION_LOCATIONS = [
  "上海市浦东新区张杨路",
  "北京市朝阳区建国路",
  "广州市天河区体育西路",
  "深圳市南山区深南大道",
  "杭州市西湖区文三路"
];

const randomViolationTime = (from: string, to: string, seed: number) => {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  const span = Math.max(b - a, 86400000);
  return new Date(a + (seed % span)).toISOString();
};

const simulateShumaiHits = (
  store: PreviewStore,
  vehicles: Vehicle[],
  range: { from: string; to: string },
  taskId: string
): number => {
  let newCount = 0;
  vehicles.forEach((v) => {
    const h = hashStr(`${v.id}-${taskId}`);
    if (h % 6 !== 0) return;
    const violationTime = randomViolationTime(range.from, range.to, h);
    const dup = store.violations.some(
      (x) =>
        x.vehicleId === v.id &&
        x.violationTime.slice(0, 10) === violationTime.slice(0, 10) &&
        x.location === VIOLATION_LOCATIONS[h % VIOLATION_LOCATIONS.length]
    );
    if (dup) return;
    const paid = h % 5 === 0;
    const handleStatus: ViolationHandleStatus = paid
      ? "PROCESSED"
      : h % 3 === 0
        ? "IN_PROGRESS"
        : "UNPROCESSED";
    store.violations.unshift({
      id: `vr-${taskId}-${v.id.slice(0, 8)}`,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      violationTime,
      location: VIOLATION_LOCATIONS[h % VIOLATION_LOCATIONS.length],
      fineAmount: [100, 200, 300, 500][h % 4],
      points: [1, 2, 3, 6][h % 4],
      status: paid ? "PAID" : "UNPAID",
      handleStatus,
      violationCode: `13${String(h % 100).padStart(2, "0")}`,
      taskId,
      processedAt: handleStatus !== "UNPROCESSED" ? violationTime : undefined,
      processedBy: handleStatus !== "UNPROCESSED" ? "运营-系统自动检测" : undefined
    });
    newCount++;
  });
  return newCount;
};

const summarizeBatchResult = (
  store: PreviewStore,
  vehicles: Vehicle[],
  range: { from: string; to: string; recentDaysOnly: boolean },
  newViolations: number
): ViolationBatchResultSummary => {
  const vehicleIds = new Set(vehicles.map((v) => v.id));
  const inRangeItems = filterViolations(store.violations, {
    dateFrom: range.from.slice(0, 10),
    dateTo: range.to.slice(0, 10)
  }).filter((v) => vehicleIds.has(v.vehicleId));

  return {
    queriedVehicles: vehicles.length,
    dateFrom: range.from.slice(0, 10),
    dateTo: range.to.slice(0, 10),
    recentDaysOnly: range.recentDaysOnly,
    newViolations,
    totalInRange: inRangeItems.length,
    unpaidCount: inRangeItems.filter((v) => v.status === "UNPAID").length,
    unprocessedCount: inRangeItems.filter((v) => v.handleStatus === "UNPROCESSED").length,
    inProgressCount: inRangeItems.filter((v) => v.handleStatus === "IN_PROGRESS").length,
    processedCount: inRangeItems.filter((v) => v.handleStatus === "PROCESSED").length
  };
};

export type CreateViolationBatchResult = {
  task: ViolationBatchTask;
  message: string;
  error?: string;
};

export const createViolationBatchTask = (
  store: PreviewStore,
  req: CreateViolationBatchRequest,
  ts: () => string
): CreateViolationBatchResult => {
  const vehicles = resolveBatchVehicles(store, req);
  if (vehicles.length === 0) {
    return { task: null as unknown as ViolationBatchTask, message: "无匹配车辆", error: "NO_VEHICLES" };
  }

  const remaining = store.violationQuota.totalQuota - store.violationQuota.usedCount;
  if (vehicles.length > remaining) {
    return {
      task: null as unknown as ViolationBatchTask,
      message: `配额不足：需 ${vehicles.length} 次，剩余 ${remaining} 次`,
      error: "QUOTA_EXCEEDED"
    };
  }

  const range = resolveQueryDateRange(req);
  const unitCost = store.violationQuota.unitCost;
  const taskId = `vt-${Date.now()}`;
  const scope = req.allFleet || !req.vehicleIds?.length ? "ALL_FLEET" : "FILTERED";

  const task: ViolationBatchTask = {
    id: taskId,
    taskNo: `VIO${Date.now()}`,
    vehicleIds: vehicles.map((v) => v.id),
    status: "RUNNING",
    provider: "SHUMAI",
    unitCost,
    totalCost: Math.round(vehicles.length * unitCost * 100) / 100,
    quotaMonth: store.violationQuota.month,
    createdAt: ts(),
    scope,
    dateFrom: range.from.slice(0, 10),
    dateTo: range.to.slice(0, 10),
    recentDaysOnly: range.recentDaysOnly,
    recentDays: range.recentDays,
    filters: {
      city: req.city,
      vehicleStatus: req.vehicleStatus
    }
  };

  store.violationTasks.unshift(task);
  store.violationQuota.usedCount += vehicles.length;

  const newViolations = simulateShumaiHits(store, vehicles, range, taskId);
  task.status = "COMPLETED";
  task.completedAt = ts();
  task.resultSummary = summarizeBatchResult(store, vehicles, range, newViolations);

  const unprocessed = task.resultSummary.unprocessedCount;
  return {
    task,
    message: `全表 ${vehicles.length} 台已查询（${task.dateFrom}～${task.dateTo}）· 新增 ${newViolations} 条 · 待处理 ${unprocessed} 条`
  };
};

export const detectViolationHandleUpdates = (store: PreviewStore): number => {
  let updated = 0;
  store.violations = store.violations.map((raw) => {
    const v = normalizeViolation(raw);
    const next = inferHandleStatus(v);
    if (next !== v.handleStatus || (v.status === "PAID" && v.handleStatus !== "PROCESSED")) {
      updated++;
      return {
        ...v,
        handleStatus: v.status === "PAID" ? "PROCESSED" : next,
        processedAt: v.processedAt ?? (v.status === "PAID" ? new Date().toISOString() : undefined)
      };
    }
    return v;
  });
  return updated;
};
