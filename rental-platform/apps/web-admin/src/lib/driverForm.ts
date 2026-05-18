import type { Driver, DriverForm } from "../features/types";

export const emptyDriverForm = (): DriverForm => ({
  name: "",
  phone: "",
  licenseNo: "",
  licenseType: "C1",
  city: "Shanghai",
  status: "AVAILABLE",
  licenseImageUrl: "",
  licenseExpiryDate: "",
  remindBeforeDays: "30"
});

export const driverToForm = (driver: Driver): DriverForm => ({
  name: driver.name,
  phone: driver.phone,
  licenseNo: driver.licenseNo,
  licenseType: driver.licenseType,
  city: driver.city,
  status: driver.status,
  licenseImageUrl: driver.licenseImageUrl ?? "",
  licenseExpiryDate: driver.licenseExpiryDate?.slice(0, 10) ?? "",
  remindBeforeDays: String(driver.remindBeforeDays ?? 30)
});

export const formToPayload = (form: DriverForm) => ({
  name: form.name.trim(),
  phone: form.phone.trim(),
  licenseNo: form.licenseNo.trim(),
  licenseType: form.licenseType.trim() || "C1",
  city: form.city.trim(),
  status: form.status,
  licenseImageUrl: form.licenseImageUrl.trim() || undefined,
  licenseExpiryDate: form.licenseExpiryDate || undefined,
  remindBeforeDays: Number(form.remindBeforeDays) || 30
});
