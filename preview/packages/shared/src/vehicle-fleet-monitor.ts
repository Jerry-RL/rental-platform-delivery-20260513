import { buildMaintenanceReminder } from "./maintenance";
import type { PreviewStore } from "./store";
import type {
  MileageMonitor,
  MileageMonitorLevel,
  MileageRecord,
  ScrapReminder,
  ScrapReminderLevel,
  Vehicle,
  VehicleAdminView
} from "./types";

/** 营运车报废里程参考（可单车覆盖） */
export const DEFAULT_SCRAP_MILEAGE_KM = 120_000;
export const DEFAULT_MAX_SERVICE_YEARS = 8;
const SCRAP_DUE_SOON_KM = 12_000;
const SCRAP_DUE_SOON_YEARS = 1;
const ANOMALY_DELTA_KM = 1_500;
const HIGH_USAGE_KM_PER_DAY = 350;
const STALE_DAYS = 45;

export const scrapReminderLabel: Record<ScrapReminderLevel, string> = {
  OK: "正常",
  DUE_SOON: "即将报废",
  OVERDUE: "建议报废",
  RETIRED: "已报废"
};

export const mileageMonitorLabel: Record<MileageMonitorLevel, string> = {
  NORMAL: "正常",
  HIGH_USAGE: "高里程",
  ANOMALY: "异常跳变",
  STALE: "久未同步"
};

export const getVehiclePurchaseDate = (v: Vehicle): string => v.purchaseDate ?? "2020-01-01";

export const getScrapMileageLimit = (v: Vehicle): number =>
  v.scrapMileageLimitKm ?? DEFAULT_SCRAP_MILEAGE_KM;

export const getMaxServiceYears = (v: Vehicle): number => v.maxServiceYears ?? DEFAULT_MAX_SERVICE_YEARS;

const serviceYears = (purchaseDate: string, at = Date.now()): number => {
  const start = new Date(purchaseDate).getTime();
  if (Number.isNaN(start)) return 0;
  return (at - start) / (365.25 * 86400000);
};

export const buildScrapReminder = (v: Vehicle): ScrapReminder => {
  if (v.status === "RETIRED") {
    return {
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      brand: v.brand,
      model: v.model,
      status: v.status,
      currentMileageKm: v.mileage,
      scrapMileageLimitKm: getScrapMileageLimit(v),
      kmUntilScrap: 0,
      purchaseDate: getVehiclePurchaseDate(v),
      serviceYears: serviceYears(getVehiclePurchaseDate(v)),
      maxServiceYears: getMaxServiceYears(v),
      yearsUntilScrap: 0,
      level: "RETIRED",
      reason: "车辆状态为报废"
    };
  }

  const limitKm = getScrapMileageLimit(v);
  const maxYears = getMaxServiceYears(v);
  const purchase = getVehiclePurchaseDate(v);
  const years = serviceYears(purchase);
  const kmUntilScrap = limitKm - v.mileage;
  const yearsUntilScrap = maxYears - years;

  let level: ScrapReminderLevel = "OK";
  const reasons: string[] = [];

  if (kmUntilScrap <= 0) {
    level = "OVERDUE";
    reasons.push(`里程已达 ${v.mileage.toLocaleString()} km（上限 ${limitKm.toLocaleString()} km）`);
  } else if (yearsUntilScrap <= 0) {
    level = "OVERDUE";
    reasons.push(`车龄 ${years.toFixed(1)} 年（上限 ${maxYears} 年）`);
  } else if (kmUntilScrap <= SCRAP_DUE_SOON_KM) {
    level = "DUE_SOON";
    reasons.push(`剩余里程约 ${kmUntilScrap.toLocaleString()} km`);
  } else if (yearsUntilScrap <= SCRAP_DUE_SOON_YEARS) {
    level = "DUE_SOON";
    reasons.push(`剩余服役约 ${yearsUntilScrap.toFixed(1)} 年`);
  }

  return {
    vehicleId: v.id,
    plateNumber: v.plateNumber,
    brand: v.brand,
    model: v.model,
    status: v.status,
    currentMileageKm: v.mileage,
    scrapMileageLimitKm: limitKm,
    kmUntilScrap,
    purchaseDate: purchase,
    serviceYears: years,
    maxServiceYears: maxYears,
    yearsUntilScrap,
    level,
    reason: reasons.length ? reasons.join("；") : "服役期内"
  };
};

const recentRecords = (records: MileageRecord[], vehicleId: string, limit = 5): MileageRecord[] =>
  records
    .filter((r) => r.vehicleId === vehicleId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
    .slice(0, limit);

export const buildMileageMonitor = (store: PreviewStore, v: Vehicle): MileageMonitor => {
  const recs = recentRecords(store.mileageRecords, v.id);
  const last = recs[0];
  const lastDeltaKm = last?.deltaKm;
  const lastRecordAt = last?.recordedAt;

  let avgKmPerDay: number | undefined;
  if (recs.length >= 2) {
    const newest = new Date(recs[0]!.recordedAt).getTime();
    const oldest = new Date(recs[recs.length - 1]!.recordedAt).getTime();
    const days = Math.max(1, (newest - oldest) / 86400000);
    const totalDelta = recs.reduce((s, r) => s + r.deltaKm, 0);
    avgKmPerDay = Math.round(totalDelta / days);
  }

  let level: MileageMonitorLevel = "NORMAL";
  let hint = "里程记录正常";

  if (lastDeltaKm != null && lastDeltaKm >= ANOMALY_DELTA_KM) {
    level = "ANOMALY";
    hint = `最近一次录入跳变 +${lastDeltaKm} km，请核对`;
  } else if (avgKmPerDay != null && avgKmPerDay >= HIGH_USAGE_KM_PER_DAY) {
    level = "HIGH_USAGE";
    hint = `近程日均约 ${avgKmPerDay} km，关注保养与残值`;
  } else if (
    v.status !== "RETIRED" &&
    (!lastRecordAt ||
      Date.now() - new Date(lastRecordAt).getTime() > STALE_DAYS * 86400000)
  ) {
    level = "STALE";
    hint = lastRecordAt
      ? `超过 ${STALE_DAYS} 天未同步里程（GPS/还车）`
      : "尚无里程流水，建议绑定 GPS 或还车录入";
  }

  return {
    vehicleId: v.id,
    plateNumber: v.plateNumber,
    brand: v.brand,
    model: v.model,
    status: v.status,
    currentMileageKm: v.mileage,
    lastRecordAt,
    lastDeltaKm,
    avgKmPerDay,
    level,
    hint
  };
};

export const enrichVehicleAdminView = (store: PreviewStore, v: Vehicle): VehicleAdminView => {
  const maint = buildMaintenanceReminder(v);
  const scrap = buildScrapReminder(v);
  const mileage = buildMileageMonitor(store, v);
  return {
    ...v,
    maintenanceLevel: maint.level,
    maintenanceLabel: maint.level === "OK" ? "正常" : maint.level === "DUE_SOON" ? "即将保养" : "已超期",
    scrapLevel: scrap.level,
    scrapLabel: scrapReminderLabel[scrap.level],
    kmUntilScrap: scrap.kmUntilScrap,
    serviceYears: scrap.serviceYears,
    mileageMonitorLevel: mileage.level,
    mileageMonitorLabel: mileageMonitorLabel[mileage.level],
    mileageMonitorHint: mileage.hint
  };
};

export const listScrapReminders = (store: PreviewStore): ScrapReminder[] =>
  store.vehicles
    .filter((v) => v.status !== "RETIRED")
    .map(buildScrapReminder)
    .filter((r) => r.level !== "OK")
    .sort((a, b) => {
      const order: Record<ScrapReminderLevel, number> = {
        OVERDUE: 0,
        DUE_SOON: 1,
        OK: 2,
        RETIRED: 3
      };
      return order[a.level] - order[b.level] || a.kmUntilScrap - b.kmUntilScrap;
    });

export const listMileageMonitors = (store: PreviewStore) =>
  store.vehicles
    .filter((v) => v.status !== "RETIRED")
    .map((v) => buildMileageMonitor(store, v))
    .filter((m) => m.level !== "NORMAL")
    .sort((a, b) => {
      const order = { ANOMALY: 0, STALE: 1, HIGH_USAGE: 2, NORMAL: 3 };
      return order[a.level] - order[b.level];
    });

export const fleetMonitorSummary = (store: PreviewStore) => {
  const scrapDue = store.vehicles.filter((v) => {
    const l = buildScrapReminder(v).level;
    return l === "DUE_SOON" || l === "OVERDUE";
  }).length;
  const mileageAlert = store.vehicles.filter((v) => {
    const l = buildMileageMonitor(store, v).level;
    return l !== "NORMAL";
  }).length;
  const maintDue = store.vehicles.filter((v) => {
    const l = buildMaintenanceReminder(v).level;
    return l === "DUE_SOON" || l === "OVERDUE";
  }).length;
  return { scrapDue, mileageAlert, maintDue };
};
