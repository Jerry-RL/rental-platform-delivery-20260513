import type { Driver, DriverStatus } from "./types";

export const driverStatusLabel: Record<DriverStatus, string> = {
  AVAILABLE: "可接单",
  ON_DUTY: "服务中",
  OFF_DUTY: "休息",
  SUSPENDED: "已停用"
};

export type DriverDetailView = Driver & {
  experienceYears: number;
  completedTrips: number;
  intro: string;
  serviceCities: string[];
  /** 管理端/详情：近期服务单量（Mock 与历史订单对齐时由 buildDriverDetail 覆盖） */
  recentOrderCount?: number;
  /** 关联违章条数（含包车期间推断） */
  violationCount?: number;
};

const hashSeed = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * 31) | 0;
  return Math.abs(h);
};

export const buildDriverDetail = (driver: Driver): DriverDetailView => {
  const seed = hashSeed(driver.id);
  const experienceYears = 5 + (seed % 12);
  const completedTrips = 800 + (seed % 4200);
  return {
    ...driver,
    experienceYears,
    completedTrips,
    intro: `从事客运驾驶 ${experienceYears} 年，熟悉${driver.city}及周边路况；持 ${driver.licenseType} 驾照，服务评分 ${driver.rating.toFixed(1)}。`,
    serviceCities: [driver.city, driver.city === "上海" ? "苏州" : "上海"].filter(
      (c, i, arr) => arr.indexOf(c) === i
    )
  };
};
