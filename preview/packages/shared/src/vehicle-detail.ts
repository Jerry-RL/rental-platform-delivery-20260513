import { buildMaintenanceReminder } from "./maintenance";
import { vehicleStatusLabel } from "./labels";
import { vehicleTypeLabel } from "./vehicle-catalog";
import type { Store, Vehicle, VehicleHistoryEvent } from "./types";

export type VehicleDetailView = {
  vehicle: Vehicle;
  store?: Store;
  typeLabel: string;
  statusLabel: string;
  maintenanceHint: string;
  maintenanceLevel: string;
};

export const buildVehicleDetail = (vehicle: Vehicle, store?: Store | null): VehicleDetailView => {
  const reminder = buildMaintenanceReminder(vehicle);
  const maintenanceHint =
    reminder.level === "OK"
      ? "保养正常"
      : reminder.level === "DUE_SOON"
        ? `即将保养（剩余约 ${reminder.kmUntilDue} km）`
        : `建议尽快保养（已超约 ${Math.abs(reminder.kmUntilDue)} km）`;

  return {
    vehicle,
    store: store ?? undefined,
    typeLabel: vehicleTypeLabel[vehicle.vehicleTypeId] ?? vehicle.vehicleTypeId,
    statusLabel: vehicleStatusLabel[vehicle.status],
    maintenanceHint,
    maintenanceLevel: reminder.level
  };
};

export const formatVehicleHistoryEvent = (e: VehicleHistoryEvent) => {
  const date = e.occurredAt.slice(0, 10);
  return { date, title: e.title, summary: e.summary };
};
