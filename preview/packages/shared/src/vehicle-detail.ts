import { buildMaintenanceReminder } from "./maintenance";
import { vehicleStatusLabel } from "./labels";
import { vehicleTypeLabel } from "./vehicle-catalog";
import { buildMileageMonitor, buildScrapReminder, scrapReminderLabel } from "./vehicle-fleet-monitor";
import type { PreviewStore } from "./store";
import type { Store, Vehicle, VehicleHistoryEvent } from "./types";

export type VehicleDetailView = {
  vehicle: Vehicle;
  store?: Store;
  typeLabel: string;
  statusLabel: string;
  maintenanceHint: string;
  maintenanceLevel: string;
  scrapHint: string;
  scrapLevel: string;
  mileageMonitorHint: string;
  mileageMonitorLevel: string;
};

export const buildVehicleDetail = (
  store: PreviewStore,
  vehicle: Vehicle,
  storeRow?: Store | null
): VehicleDetailView => {
  const reminder = buildMaintenanceReminder(vehicle);
  const maintenanceHint =
    reminder.level === "OK"
      ? "保养正常"
      : reminder.level === "DUE_SOON"
        ? `即将保养（剩余约 ${reminder.kmUntilDue} km）`
        : `建议尽快保养（已超约 ${Math.abs(reminder.kmUntilDue)} km）`;

  const scrap = buildScrapReminder(vehicle);
  const mileageMon = buildMileageMonitor(store, vehicle);

  return {
    vehicle,
    store: storeRow ?? undefined,
    typeLabel: vehicleTypeLabel[vehicle.vehicleTypeId] ?? vehicle.vehicleTypeId,
    statusLabel: vehicleStatusLabel[vehicle.status],
    maintenanceHint,
    maintenanceLevel: reminder.level,
    scrapHint: scrap.reason,
    scrapLevel: scrap.level,
    mileageMonitorHint: mileageMon.hint,
    mileageMonitorLevel: mileageMon.level
  };
};

export const formatVehicleHistoryEvent = (e: VehicleHistoryEvent) => {
  const date = e.occurredAt.slice(0, 10);
  return { date, title: e.title, summary: e.summary };
};
