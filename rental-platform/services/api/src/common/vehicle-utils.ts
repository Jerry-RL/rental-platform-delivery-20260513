import type { Vehicle, VehicleReminderLevel } from "./types.js";

const DEFAULT_REMIND_DAYS = 30;
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=260&fit=crop";

export function computeReminderLevel(expiryDate: string | undefined, remindBeforeDays: number, now = new Date()): VehicleReminderLevel {
  if (!expiryDate) {
    return "UNKNOWN";
  }
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) {
    return "UNKNOWN";
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const diffMs = expiryDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return "EXPIRED";
  }
  if (diffDays <= remindBeforeDays) {
    return "EXPIRING_SOON";
  }
  return "OK";
}

export function normalizeVehicle(vehicle: Vehicle): Vehicle {
  const now = new Date().toISOString();
  return {
    ...vehicle,
    brand: vehicle.brand ?? "",
    model: vehicle.model ?? "",
    vin: vehicle.vin ?? "",
    mileage: vehicle.mileage ?? 0,
    imageUrl: vehicle.imageUrl || PLACEHOLDER_IMAGE,
    images: vehicle.images ?? (vehicle.imageUrl ? [vehicle.imageUrl] : [PLACEHOLDER_IMAGE]),
    insuranceExpiryDate: vehicle.insuranceExpiryDate ?? "",
    annualReviewExpiryDate: vehicle.annualReviewExpiryDate ?? "",
    remindBeforeDays: vehicle.remindBeforeDays ?? DEFAULT_REMIND_DAYS,
    createdAt: vehicle.createdAt ?? now,
    updatedAt: vehicle.updatedAt ?? now
  };
}

export function enrichVehicle(vehicle: Vehicle) {
  const normalized = normalizeVehicle(vehicle);
  return {
    ...normalized,
    insuranceReminder: computeReminderLevel(normalized.insuranceExpiryDate, normalized.remindBeforeDays),
    annualReviewReminder: computeReminderLevel(normalized.annualReviewExpiryDate, normalized.remindBeforeDays)
  };
}
