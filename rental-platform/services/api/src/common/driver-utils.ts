import type { Driver, DriverDetail, VehicleReminderLevel } from "./types.js";
import { computeReminderLevel } from "./vehicle-utils.js";

const DEFAULT_REMIND_DAYS = 30;
const PLACEHOLDER_LICENSE =
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=260&fit=crop";

export function normalizeDriver(driver: Driver): Driver {
  const now = new Date().toISOString();
  const imageUrl = driver.licenseImageUrl || PLACEHOLDER_LICENSE;
  return {
    ...driver,
    licenseImageUrl: imageUrl,
    licenseImages: driver.licenseImages ?? (driver.licenseImageUrl ? [driver.licenseImageUrl] : [PLACEHOLDER_LICENSE]),
    licenseExpiryDate: driver.licenseExpiryDate ?? "",
    remindBeforeDays: driver.remindBeforeDays ?? DEFAULT_REMIND_DAYS,
    updatedAt: driver.updatedAt ?? now
  };
}

export function enrichDriver(driver: Driver): DriverDetail {
  const normalized = normalizeDriver(driver);
  return {
    ...normalized,
    licenseReminder: computeReminderLevel(normalized.licenseExpiryDate, normalized.remindBeforeDays)
  };
}

export function isLicenseValidForRental(reminder: VehicleReminderLevel) {
  return reminder !== "EXPIRED";
}
