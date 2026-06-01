import type { PreviewStore } from "./store";
import type { Vehicle, VehicleHistoryEvent, VehicleHistoryTimeline } from "./types";
import { orderStatusLabel } from "./labels";
import { maintenanceOrderStatusLabel } from "./labels";

const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const formatDate = (iso: string) => iso.slice(0, 10);

const pushOrderEvents = (events: VehicleHistoryEvent[], vehicle: Vehicle, store: PreviewStore) => {
  const orders = store.orders.filter((o) => o.vehicleId === vehicle.id);
  for (const o of orders) {
    events.push({
      id: `hist-order-${o.id}-pickup`,
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      eventType: "ORDER",
      title: `租赁订单 · ${o.orderNo}`,
      summary: `${formatDate(o.pickupTime)} 取车 → ${formatDate(o.returnTime)} 还车 · ${o.serviceMode === "WITH_DRIVER" ? "包车" : "自驾"} · ${orderStatusLabel[o.status]}`,
      occurredAt: o.pickupTime,
      amount: o.totalFee,
      status: o.status,
      refType: "ORDER",
      refId: o.id
    });
    if (["COMPLETED", "SETTLED", "RETURN_PENDING_SETTLEMENT"].includes(o.status)) {
      events.push({
        id: `hist-order-${o.id}-return`,
        vehicleId: vehicle.id,
        plateNumber: vehicle.plateNumber,
        eventType: "ORDER",
        title: `还车结算 · ${o.orderNo}`,
        summary: `租期结束，费用 ${o.totalFee} 元，已付 ${o.paidAmount} 元`,
        occurredAt: o.returnTime,
        amount: o.totalFee,
        status: o.status,
        refType: "ORDER",
        refId: o.id
      });
    }
  }
};

const pushMaintenanceEvents = (events: VehicleHistoryEvent[], vehicle: Vehicle, store: PreviewStore) => {
  for (const m of store.maintenanceOrders.filter((x) => x.vehicleId === vehicle.id)) {
    const isRepair = m.orderType === "REPAIR";
    const at = m.completedAt ?? m.scheduledAt;
    events.push({
      id: `hist-mo-${m.id}`,
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      eventType: isRepair ? "REPAIR" : "MAINTENANCE",
      title: `${isRepair ? "维修" : "保养"} · ${m.workOrderNo}`,
      summary: m.description ?? m.title,
      occurredAt: at,
      amount: m.actualCost ?? m.estimatedCost,
      status: maintenanceOrderStatusLabel[m.status],
      refType: "MAINTENANCE",
      refId: m.id
    });
  }
};

const pushInsuranceAndReview = (events: VehicleHistoryEvent[], vehicle: Vehicle) => {
  const h = hashStr(vehicle.id);
  if (!events.some((e) => e.eventType === "INSURANCE")) {
    [2024, 2025].forEach((y, i) => {
      events.push({
        id: `hist-ins-${vehicle.id}-${y}`,
        vehicleId: vehicle.id,
        plateNumber: vehicle.plateNumber,
        eventType: "INSURANCE",
        title: i === 0 ? "交强险+商业险首保" : "保险续保",
        summary: `保单年度 ${y} · 含车损/三者/座位险 · 合作保险公司`,
        occurredAt: `${y}-${String(6 + ((h + i) % 6)).padStart(2, "0")}-12T08:00:00.000Z`,
        amount: 4500 + (h % 1500) + i * 200,
        status: "已生效",
        refType: "INSURANCE",
        refId: `pol-${vehicle.id}-${y}`
      });
    });
    const expiryYear = vehicle.insuranceExpiryDate.slice(0, 4);
    events.push({
      id: `hist-ins-${vehicle.id}-cur`,
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      eventType: "INSURANCE",
      title: "当前保单续保",
      summary: `保单到期日 ${vehicle.insuranceExpiryDate} · 保费按月摊销入账（FR-VEH-007）`,
      occurredAt: `${expiryYear}-01-20T08:00:00.000Z`,
      amount: 5200 + (h % 800),
      status: new Date(vehicle.insuranceExpiryDate) < new Date() ? "即将到期" : "有效",
      refType: "INSURANCE",
      refId: `pol-${vehicle.id}-cur`
    });
  }

  const reviewYear = parseInt(vehicle.annualReviewExpiryDate.slice(0, 4), 10) - 1;
  events.push({
    id: `hist-review-${vehicle.id}`,
    vehicleId: vehicle.id,
    plateNumber: vehicle.plateNumber,
    eventType: "ANNUAL_REVIEW",
    title: "年检合格",
    summary: `检验有效期至 ${vehicle.annualReviewExpiryDate} · 检测站：机动车安全检验`,
    occurredAt: `${reviewYear}-08-01T09:00:00.000Z`,
    status: new Date(vehicle.annualReviewExpiryDate) < new Date() ? "已过期" : "有效",
    refType: "ASSET",
    refId: vehicle.id
  });
};

const synthPurchase = (vehicle: Vehicle): VehicleHistoryEvent => {
  const h = hashStr(vehicle.id);
  const year = 2021 + (h % 4);
  const price = 120000 + (h % 180000);
  return {
    id: `hist-purchase-${vehicle.id}`,
    vehicleId: vehicle.id,
    plateNumber: vehicle.plateNumber,
    eventType: "PURCHASE",
    title: "车辆采购入库",
    summary: `${vehicle.brand} ${vehicle.model} · VIN ${vehicle.vin.slice(-8)} · 上海/北京门店配车`,
    occurredAt: `${year}-${String(2 + (h % 10)).padStart(2, "0")}-18T10:00:00.000Z`,
    amount: price,
    status: "已入库",
    refType: "ASSET",
    refId: vehicle.id
  };
};

/** 聚合购买、保养、保险、维修、订单，按时间升序 */
export const buildVehicleHistory = (store: PreviewStore, vehicleId: string): VehicleHistoryTimeline | null => {
  const vehicle = store.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) return null;

  const events: VehicleHistoryEvent[] = [];

  const seeded = store.vehicleHistoryEvents.filter((e) => e.vehicleId === vehicleId);
  const hasPurchase = seeded.some((e) => e.eventType === "PURCHASE");
  events.push(...seeded);
  if (!hasPurchase) events.push(synthPurchase(vehicle));

  pushInsuranceAndReview(events, vehicle);
  pushMaintenanceEvents(events, vehicle, store);
  pushOrderEvents(events, vehicle, store);

  const dedup = new Map<string, VehicleHistoryEvent>();
  for (const e of events) dedup.set(e.id, e);

  const sorted = [...dedup.values()].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  return {
    vehicleId: vehicle.id,
    plateNumber: vehicle.plateNumber,
    brand: vehicle.brand,
    model: vehicle.model,
    vin: vehicle.vin,
    currentMileageKm: vehicle.mileage,
    events: sorted
  };
};
