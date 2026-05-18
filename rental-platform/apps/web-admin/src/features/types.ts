export type ViolationTaskStatus = "PENDING" | "RUNNING" | "PARTIAL_SUCCESS" | "SUCCESS" | "FAILED";

export type ViolationTask = {
  id: string;
  status: ViolationTaskStatus;
  totalVehicles: number;
  successVehicles: number;
  failedVehicles: number;
  totalCost: number;
  createdAt: string;
};

export type ViolationQuota = {
  month: string;
  limit: number;
  used: number;
  overageStrategy: "DENY" | "APPROVAL" | "PAID";
};

export type IntegrationCost = {
  id: string;
  date: string;
  type: "VIOLATION" | "GPS";
  quantity: number;
  unitCost: number;
  totalCost: number;
};

export type ReminderRule = {
  insuranceEnabled: boolean;
  annualReviewEnabled: boolean;
  remindBeforeDays: number;
};

export type MapPolicy = {
  mapMode: "MAP_VENDOR_DIRECT" | "GPS_VENDOR_PROXY";
  authStatus: "UNCONFIRMED" | "AUTHORIZED" | "RESTRICTED";
};

export type GpsSnapshot = {
  vehicleId: string;
  lng: number;
  lat: number;
  speed: number;
  provider: string;
  onlineStatus: "ONLINE" | "OFFLINE" | "UNKNOWN";
  locatedAt: string;
};
