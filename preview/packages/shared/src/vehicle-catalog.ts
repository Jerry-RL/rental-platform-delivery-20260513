import type { Vehicle } from "./types";

export const vehicleTypeLabel: Record<string, string> = {
  ECONOMY: "经济型",
  SEDAN: "轿车",
  SUV: "SUV",
  MPV: "商务MPV",
  NEW_ENERGY: "新能源",
  LUXURY: "豪华"
};

export type VehicleTypeSummary = {
  vehicleTypeId: string;
  label: string;
  minDailyPrice: number;
  availableCount: number;
  modelCount: number;
  imageUrl: string;
  sampleBrands: string[];
};

export type VehicleModelOffering = {
  key: string;
  vehicleTypeId: string;
  typeLabel: string;
  brand: string;
  model: string;
  title: string;
  minDailyPrice: number;
  availableCount: number;
  imageUrl: string;
  /** 该型号下可租车辆（已按日价升序） */
  vehicles: Vehicle[];
};

const modelKey = (v: Vehicle) => `${v.vehicleTypeId}|${v.brand}|${v.model}`;

export const buildVehicleTypeSummaries = (vehicles: Vehicle[]): VehicleTypeSummary[] => {
  const byType = new Map<string, Vehicle[]>();
  for (const v of vehicles) {
    const list = byType.get(v.vehicleTypeId) ?? [];
    list.push(v);
    byType.set(v.vehicleTypeId, list);
  }
  return [...byType.entries()]
    .map(([vehicleTypeId, list]) => {
      const sorted = [...list].sort((a, b) => a.dailyPrice - b.dailyPrice);
      const models = new Set(list.map((x) => `${x.brand} ${x.model}`));
      return {
        vehicleTypeId,
        label: vehicleTypeLabel[vehicleTypeId] ?? vehicleTypeId,
        minDailyPrice: sorted[0]?.dailyPrice ?? 0,
        availableCount: list.length,
        modelCount: models.size,
        imageUrl: sorted[0]?.imageUrl ?? "",
        sampleBrands: [...new Set(list.map((x) => x.brand))].slice(0, 3)
      };
    })
    .sort((a, b) => a.minDailyPrice - b.minDailyPrice);
};

/** 按车型 + 品牌 + 车款聚合，用于首页多型号选车 */
export const buildVehicleModelOfferings = (
  vehicles: Vehicle[],
  vehicleTypeId?: string
): VehicleModelOffering[] => {
  const filtered = vehicleTypeId
    ? vehicles.filter((v) => v.vehicleTypeId === vehicleTypeId)
    : vehicles;
  const map = new Map<string, Vehicle[]>();
  for (const v of filtered) {
    const k = modelKey(v);
    const list = map.get(k) ?? [];
    list.push(v);
    map.set(k, list);
  }
  return [...map.entries()]
    .map(([key, list]) => {
      const sorted = [...list].sort((a, b) => a.dailyPrice - b.dailyPrice);
      const first = sorted[0];
      return {
        key,
        vehicleTypeId: first.vehicleTypeId,
        typeLabel: vehicleTypeLabel[first.vehicleTypeId] ?? first.vehicleTypeId,
        brand: first.brand,
        model: first.model,
        title: `${first.brand} ${first.model}`,
        minDailyPrice: first.dailyPrice,
        availableCount: sorted.length,
        imageUrl: first.imageUrl,
        vehicles: sorted
      };
    })
    .sort((a, b) => a.minDailyPrice - b.minDailyPrice);
};

export const pickVehicleForBooking = (
  vehicles: Vehicle[],
  opts: {
    vehicleId?: string;
    vehicleTypeId?: string;
    brand?: string;
    model?: string;
    city?: string;
  }
): Vehicle | null => {
  let list = vehicles.filter((v) => v.status === "AVAILABLE");
  if (opts.city) list = list.filter((v) => v.city === opts.city);
  if (opts.vehicleTypeId) list = list.filter((v) => v.vehicleTypeId === opts.vehicleTypeId);
  if (opts.brand) list = list.filter((v) => v.brand === opts.brand);
  if (opts.model) list = list.filter((v) => v.model === opts.model);
  if (opts.vehicleId) {
    const exact = list.find((v) => v.id === opts.vehicleId) ?? vehicles.find((v) => v.id === opts.vehicleId);
    if (exact) return exact;
  }
  return list.sort((a, b) => a.dailyPrice - b.dailyPrice)[0] ?? null;
};
