import type { Vehicle, VehicleForm } from "../features/types";

export const emptyVehicleForm = (): VehicleForm => ({
  plateNumber: "",
  vehicleTypeId: "SUV",
  city: "Shanghai",
  dailyPrice: "399",
  status: "AVAILABLE",
  brand: "",
  model: "",
  vin: "",
  mileage: "0",
  imageUrl: "",
  insuranceExpiryDate: "",
  annualReviewExpiryDate: "",
  remindBeforeDays: "30"
});

export const vehicleToForm = (vehicle: Vehicle): VehicleForm => ({
  plateNumber: vehicle.plateNumber,
  vehicleTypeId: vehicle.vehicleTypeId,
  city: vehicle.city,
  dailyPrice: String(vehicle.dailyPrice),
  status: vehicle.status,
  brand: vehicle.brand ?? "",
  model: vehicle.model ?? "",
  vin: vehicle.vin ?? "",
  mileage: String(vehicle.mileage ?? 0),
  imageUrl: vehicle.imageUrl ?? "",
  insuranceExpiryDate: vehicle.insuranceExpiryDate?.slice(0, 10) ?? "",
  annualReviewExpiryDate: vehicle.annualReviewExpiryDate?.slice(0, 10) ?? "",
  remindBeforeDays: String(vehicle.remindBeforeDays ?? 30)
});

export const formToPayload = (form: VehicleForm) => ({
  plateNumber: form.plateNumber.trim(),
  vehicleTypeId: form.vehicleTypeId.trim(),
  city: form.city.trim(),
  dailyPrice: Number(form.dailyPrice),
  status: form.status,
  brand: form.brand.trim(),
  model: form.model.trim(),
  vin: form.vin.trim(),
  mileage: Number(form.mileage) || 0,
  imageUrl: form.imageUrl.trim() || undefined,
  insuranceExpiryDate: form.insuranceExpiryDate || undefined,
  annualReviewExpiryDate: form.annualReviewExpiryDate || undefined,
  remindBeforeDays: Number(form.remindBeforeDays) || 30
});
