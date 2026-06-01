/**
 * 车队批量模拟数据生成器（约 200 台，对齐 SRS 重资产车队规模）
 */
import { getVehicleImageUrl } from "./vehicle-images";
import type {
  GpsSnapshot,
  MaintenanceOrder,
  MaintenanceOrderStatus,
  MaintenanceOrderType,
  MileageRecord,
  MileageRecordSource,
  Store,
  Vehicle,
  VehicleStatus,
  ViolationBatchTask,
  ViolationHandleStatus,
  ViolationRecord,
  ViolationQuota
} from "./types";

export type FleetSeedBundle = {
  extraStores: Store[];
  fleetVehicles: Vehicle[];
  mileageRecords: MileageRecord[];
  violations: ViolationRecord[];
  maintenanceOrders: MaintenanceOrder[];
  violationTasks: ViolationBatchTask[];
  gpsSnapshots: GpsSnapshot[];
  violationQuota: ViolationQuota;
};

const CITY_CONFIG = [
  { city: "上海", storeSuffix: "虹桥", count: 72, platePrefix: "沪", plateLetters: ["A", "B", "C", "D", "E"] },
  { city: "北京", storeSuffix: "朝阳", count: 48, platePrefix: "京", plateLetters: ["A", "B", "C", "E"] },
  { city: "广州", storeSuffix: "天河", count: 30, platePrefix: "粤", plateLetters: ["A"] },
  { city: "深圳", storeSuffix: "南山", count: 26, platePrefix: "粤", plateLetters: ["B"] },
  { city: "杭州", storeSuffix: "西湖", count: 14, platePrefix: "浙", plateLetters: ["A"] },
  { city: "成都", storeSuffix: "高新", count: 6, platePrefix: "川", plateLetters: ["A"] }
] as const;

/** 生成车辆总数（不含演示用 4 台核心车） */
export const FLEET_GENERATED_COUNT = CITY_CONFIG.reduce((s, c) => s + c.count, 0);

const MODEL_CATALOG: Record<
  string,
  { brand: string; models: string[]; types: string[]; priceRange: [number, number] }
> = {
  丰田: { brand: "丰田", models: ["RAV4", "凯美瑞", "卡罗拉", "汉兰达"], types: ["SUV", "SEDAN", "SEDAN", "SUV"], priceRange: [279, 459] },
  大众: { brand: "大众", models: ["帕萨特", "途观L", "朗逸", "迈腾"], types: ["SEDAN", "SUV", "SEDAN", "SEDAN"], priceRange: [259, 429] },
  本田: { brand: "本田", models: ["CR-V", "雅阁", "缤智", "奥德赛"], types: ["SUV", "SEDAN", "SUV", "MPV"], priceRange: [289, 499] },
  日产: { brand: "日产", models: ["天籁", "奇骏", "轩逸", "逍客"], types: ["SEDAN", "SUV", "SEDAN", "SUV"], priceRange: [249, 399] },
  别克: { brand: "别克", models: ["GL8", "君威", "昂科威", "英朗"], types: ["MPV", "SEDAN", "SUV", "SEDAN"], priceRange: [269, 549] },
  宝马: { brand: "宝马", models: ["3系", "5系", "X3", "X5"], types: ["LUXURY", "LUXURY", "SUV", "SUV"], priceRange: [599, 1299] },
  奔驰: { brand: "奔驰", models: ["C级", "E级", "GLC", "V260"], types: ["LUXURY", "LUXURY", "SUV", "MPV"], priceRange: [699, 1499] },
  奥迪: { brand: "奥迪", models: ["A4L", "A6L", "Q5L", "Q7"], types: ["LUXURY", "LUXURY", "SUV", "SUV"], priceRange: [649, 1399] },
  比亚迪: { brand: "比亚迪", models: ["汉EV", "唐DM-i", "海豹", "宋PLUS"], types: ["NEW_ENERGY", "SUV", "NEW_ENERGY", "SUV"], priceRange: [319, 499] },
  特斯拉: { brand: "特斯拉", models: ["Model 3", "Model Y"], types: ["NEW_ENERGY", "NEW_ENERGY"], priceRange: [449, 599] },
  吉利: { brand: "吉利", models: ["博越", "星越L", "帝豪"], types: ["SUV", "SUV", "ECONOMY"], priceRange: [199, 329] },
  哈弗: { brand: "哈弗", models: ["H6", "大狗", "初恋"], types: ["SUV", "SUV", "SUV"], priceRange: [219, 349] },
  五菱: { brand: "五菱", models: ["宏光MINI", "凯捷"], types: ["ECONOMY", "MPV"], priceRange: [129, 259] },
  理想: { brand: "理想", models: ["L7", "L8", "L9"], types: ["SUV", "SUV", "SUV"], priceRange: [499, 799] },
  蔚来: { brand: "蔚来", models: ["ET5", "ES6", "EC6"], types: ["NEW_ENERGY", "SUV", "SUV"], priceRange: [549, 899] }
};

const STATUS_WEIGHTS: { status: VehicleStatus; weight: number }[] = [
  { status: "AVAILABLE", weight: 52 },
  { status: "IN_USE", weight: 22 },
  { status: "OCCUPIED", weight: 10 },
  { status: "MAINTENANCE", weight: 8 },
  { status: "ACCIDENT_HOLD", weight: 4 },
  { status: "RETIRED", weight: 4 }
];

const VIOLATION_LOCATIONS = [
  "上海市浦东新区世纪大道",
  "上海市静安区南京西路",
  "上海市徐汇区漕溪北路",
  "北京市朝阳区建国路",
  "北京市海淀区中关村大街",
  "广州市天河区天河路",
  "深圳市南山区深南大道",
  "杭州市西湖区文三路",
  "成都市高新区天府大道",
  "上海市黄浦区延安东路",
  "北京市东城区王府井大街",
  "广州市越秀区中山五路"
];

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)];

const vehicleUuid = (seq: number) => {
  const hex = seq.toString(16).padStart(12, "0");
  return `d4000001-0001-4000-8000-${hex}`;
};

const storeUuid = (seq: number) => {
  const hex = seq.toString(16).padStart(12, "0");
  return `c3000001-0001-4000-8000-${hex}`;
};

const weightedStatus = (rng: () => number): VehicleStatus => {
  const total = STATUS_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = rng() * total;
  for (const { status, weight } of STATUS_WEIGHTS) {
    r -= weight;
    if (r <= 0) return status;
  }
  return "AVAILABLE";
};

const formatPlate = (prefix: string, letter: string, seq: number) => {
  const num = String(10000 + seq).slice(-5);
  return `${prefix}${letter}${num}`;
};

const formatVin = (rng: () => number) => {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  let vin = "LV";
  for (let i = 0; i < 15; i++) vin += chars[Math.floor(rng() * chars.length)];
  return vin;
};

const addDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const generateFleetSeed = (startSeq = 5): FleetSeedBundle => {
  const rng = mulberry32(20260513);
  const baseDate = new Date("2026-05-28");

  const extraStores: Store[] = CITY_CONFIG.map((c, i) => ({
    id: i < 2 ? (i === 0 ? "c3000001-0001-4000-8000-000000000001" : "c3000001-0001-4000-8000-000000000002") : storeUuid(10 + i),
    name: `${c.city}${c.storeSuffix}店`,
    city: c.city,
    address: `${c.city}市运营中心 ${c.storeSuffix}片区`,
    phone: `0${10 + i}-8888${String(1000 + i).slice(-4)}`
  }));

  const storeByCity = Object.fromEntries(extraStores.map((s) => [s.city, s.id]));

  const catalogKeys = Object.keys(MODEL_CATALOG);
  const fleetVehicles: Vehicle[] = [];
  let globalSeq = 0;

  for (const cfg of CITY_CONFIG) {
    const storeId = storeByCity[cfg.city];
    for (let i = 0; i < cfg.count; i++) {
      globalSeq++;
      const seq = startSeq + globalSeq - 1;
      const brandKey = pick(rng, catalogKeys);
      const cat = MODEL_CATALOG[brandKey];
      const modelIdx = Math.floor(rng() * cat.models.length);
      const vehicleTypeId = cat.types[modelIdx] ?? cat.types[0];
      const model = cat.models[modelIdx];
      const mileage = Math.floor(5000 + rng() * 115000);
      const interval = rng() > 0.85 ? 15000 : 10000;
      const lastMaint = Math.floor(mileage - rng() * (interval + 3000));
      const status = weightedStatus(rng);
      const letter = pick(rng, [...cfg.plateLetters]);
      const dailyPrice = Math.round(cat.priceRange[0] + rng() * (cat.priceRange[1] - cat.priceRange[0]));

      fleetVehicles.push({
        id: vehicleUuid(seq),
        plateNumber: formatPlate(cfg.platePrefix, letter, globalSeq + 100),
        vehicleTypeId,
        city: cfg.city,
        storeId,
        dailyPrice,
        status,
        brand: cat.brand,
        model,
        vin: formatVin(rng),
        mileage,
        lastMaintenanceMileageKm: Math.max(0, lastMaint),
        maintenanceIntervalKm: interval,
        lastMaintenanceAt: addDays(baseDate, -Math.floor(rng() * 180)),
        gpsProvider: rng() > 0.45 ? (rng() > 0.5 ? "TUQIANG" : "CHENGZAI") : undefined,
        imageUrl: getVehicleImageUrl(globalSeq, vehicleTypeId),
        insuranceExpiryDate: addDays(baseDate, Math.floor(rng() * 240) - 30),
        annualReviewExpiryDate: addDays(baseDate, Math.floor(rng() * 200) + 30)
      });
    }
  }

  const mileageRecords: MileageRecord[] = [];
  const sources: MileageRecordSource[] = ["ORDER_RETURN", "MANUAL", "GPS_SYNC"];
  let mrSeq = 0;
  for (const v of fleetVehicles) {
    const recordCount = rng() > 0.6 ? 3 : rng() > 0.35 ? 2 : 1;
    let prev = Math.max(0, v.mileage - Math.floor(800 + rng() * 4000));
    for (let j = 0; j < recordCount; j++) {
      mrSeq++;
      const delta = j === recordCount - 1 ? v.mileage - prev : Math.floor(100 + rng() * 1200);
      const km = prev + delta;
      mileageRecords.push({
        id: `mr-fleet-${String(mrSeq).padStart(5, "0")}`,
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        mileageKm: km,
        previousMileageKm: prev,
        deltaKm: delta,
        source: pick(rng, sources),
        recordedAt: new Date(baseDate.getTime() - (recordCount - j) * 86400000 * (3 + Math.floor(rng() * 20))).toISOString(),
        recordedBy: j % 2 === 0 ? "门店系统" : "GPS 自动同步"
      });
      prev = km;
    }
  }

  const violations: ViolationRecord[] = [];
  const violationPool = fleetVehicles.filter((v) => rng() > 0.55);
  violationPool.forEach((v, idx) => {
    const count = rng() > 0.8 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      violations.push({
        id: `vr-fleet-${String(idx * 2 + k + 1).padStart(5, "0")}`,
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        violationTime: new Date(baseDate.getTime() - Math.floor(rng() * 120) * 86400000).toISOString(),
        location: pick(rng, VIOLATION_LOCATIONS),
        fineAmount: [100, 200, 300, 500, 800][Math.floor(rng() * 5)],
        points: [1, 2, 3, 6][Math.floor(rng() * 4)],
        status: rng() > 0.4 ? "UNPAID" : "PAID",
        handleStatus: ((): ViolationHandleStatus => {
          if (rng() > 0.75) return "PROCESSED";
          if (rng() > 0.55) return "IN_PROGRESS";
          if (rng() > 0.92) return "WAIVED";
          return "UNPROCESSED";
        })(),
        violationCode: `16${String(Math.floor(rng() * 90) + 10)}`
      });
    }
  });

  const maintenanceOrders: MaintenanceOrder[] = [];
  const moTypes: MaintenanceOrderType[] = ["ROUTINE", "REPAIR"];
  const moStatuses: MaintenanceOrderStatus[] = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  const maintCandidates = fleetVehicles.filter(
    (v) => v.status === "MAINTENANCE" || v.status === "ACCIDENT_HOLD" || rng() > 0.88
  );
  maintCandidates.slice(0, 48).forEach((v, idx) => {
    const orderType = v.status === "ACCIDENT_HOLD" ? "REPAIR" : pick(rng, moTypes);
    const status =
      v.status === "MAINTENANCE"
        ? pick(rng, ["IN_PROGRESS", "SCHEDULED"] as MaintenanceOrderStatus[])
        : pick(rng, moStatuses);
    const estimated = Math.round(400 + rng() * 8000);
    maintenanceOrders.push({
      id: `mo-fleet-${String(idx + 1).padStart(4, "0")}`,
      workOrderNo: `WO2026${String(5000 + idx)}`,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      orderType,
      status,
      title:
        orderType === "ROUTINE"
          ? pick(rng, ["常规保养-机油三滤", "轮胎换位与动平衡", "空调滤芯更换", "刹车片检查"])
          : pick(rng, ["钣金喷漆", "变速箱检修", "冷却系统漏水", "事故定损维修", "电瓶更换"]),
      description: "模拟维保工单",
      estimatedCost: estimated,
      actualCost: status === "COMPLETED" ? Math.round(estimated * (0.85 + rng() * 0.2)) : undefined,
      scheduledAt: new Date(baseDate.getTime() - Math.floor(rng() * 30) * 86400000).toISOString(),
      completedAt:
        status === "COMPLETED"
          ? new Date(baseDate.getTime() - Math.floor(rng() * 10) * 86400000).toISOString()
          : undefined,
      mileageAtService: v.lastMaintenanceMileageKm + v.maintenanceIntervalKm,
      storeId: v.storeId
    });
  });

  const violationTasks: ViolationBatchTask[] = [];
  for (let t = 0; t < 18; t++) {
    const batchSize = Math.floor(5 + rng() * 25);
    const shuffled = [...fleetVehicles].sort(() => rng() - 0.5);
    const vehicleIds = shuffled.slice(0, batchSize).map((v) => v.id);
    const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "RUNNING", "FAILED", "PENDING"] as const;
    const st = statuses[Math.floor(rng() * statuses.length)];
    const dateTo = new Date(baseDate.getTime() - t * 3 * 86400000);
    const dateFrom = new Date(dateTo.getTime() - 30 * 86400000);
    violationTasks.push({
      id: `vt-fleet-${String(t + 1).padStart(3, "0")}`,
      taskNo: `VIO20260${5 - Math.floor(t / 6)}${String(100 + t)}`,
      vehicleIds,
      status: st,
      provider: "SHUMAI",
      unitCost: 0.06,
      totalCost: Math.round(vehicleIds.length * 0.06 * 100) / 100,
      quotaMonth: t < 6 ? "2026-05" : t < 12 ? "2026-04" : "2026-03",
      createdAt: dateTo.toISOString(),
      completedAt: st === "COMPLETED" ? new Date(dateTo.getTime() - 3600000).toISOString() : undefined,
      scope: vehicleIds.length > 40 ? "ALL_FLEET" : "FILTERED",
      dateFrom: dateFrom.toISOString().slice(0, 10),
      dateTo: dateTo.toISOString().slice(0, 10),
      recentDaysOnly: t % 2 === 0,
      recentDays: 30
    });
  }

  const gpsSnapshots: GpsSnapshot[] = [];
  const cityCoords: Record<string, [number, number]> = {
    上海: [31.23, 121.47],
    北京: [39.9, 116.4],
    广州: [23.13, 113.26],
    深圳: [22.54, 114.06],
    杭州: [30.25, 120.17],
    成都: [30.57, 104.07]
  };
  fleetVehicles
    .filter((v) => (v.status === "IN_USE" || v.status === "AVAILABLE") && v.gpsProvider)
    .forEach((v) => {
      const [lat, lng] = cityCoords[v.city] ?? [31.2, 121.4];
      gpsSnapshots.push({
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        lat: lat + (rng() - 0.5) * 0.08,
        lng: lng + (rng() - 0.5) * 0.08,
        speed: v.status === "IN_USE" ? Math.floor(20 + rng() * 80) : 0,
        online: rng() > 0.08,
        provider: v.gpsProvider!,
        updatedAt: new Date(baseDate.getTime() - Math.floor(rng() * 3600000)).toISOString()
      });
    });

  const totalQuotaUsed = violationTasks
    .filter((t) => t.status === "COMPLETED" || t.status === "RUNNING")
    .reduce((s, t) => s + t.vehicleIds.length, 0);

  return {
    extraStores: extraStores.slice(2),
    fleetVehicles,
    mileageRecords,
    violations,
    maintenanceOrders,
    violationTasks,
    gpsSnapshots,
    violationQuota: {
      month: "2026-05",
      totalQuota: 400,
      usedCount: Math.min(380, totalQuotaUsed + 12),
      unitCost: 0.06
    }
  };
};
