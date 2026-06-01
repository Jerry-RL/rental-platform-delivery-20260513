import type { MaintenanceReminder, MaintenanceReminderLevel, Vehicle } from "./types";

const DUE_SOON_KM = 2000;

export const calcNextDueMileage = (v: Vehicle) => v.lastMaintenanceMileageKm + v.maintenanceIntervalKm;

export const calcMaintenanceLevel = (kmUntilDue: number): MaintenanceReminderLevel => {
  if (kmUntilDue < 0) return "OVERDUE";
  if (kmUntilDue <= DUE_SOON_KM) return "DUE_SOON";
  return "OK";
};

export const buildMaintenanceReminder = (v: Vehicle): MaintenanceReminder => {
  const nextDueMileageKm = calcNextDueMileage(v);
  const kmUntilDue = nextDueMileageKm - v.mileage;
  const level = calcMaintenanceLevel(kmUntilDue);
  const avgKmPerDay = 80;
  const daysUntil = Math.ceil(kmUntilDue / avgKmPerDay);
  const estimatedDueDate =
    daysUntil > 0 && daysUntil < 365
      ? new Date(Date.now() + daysUntil * 86400000).toISOString().slice(0, 10)
      : undefined;

  return {
    vehicleId: v.id,
    plateNumber: v.plateNumber,
    brand: v.brand,
    model: v.model,
    currentMileageKm: v.mileage,
    lastMaintenanceMileageKm: v.lastMaintenanceMileageKm,
    nextDueMileageKm,
    kmUntilDue,
    level,
    estimatedDueDate
  };
};

export const maintenanceReminderLabel: Record<MaintenanceReminderLevel, string> = {
  OK: "正常",
  DUE_SOON: "即将保养",
  OVERDUE: "已超期"
};
