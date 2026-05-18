export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type Driver = {
  id: string;
  driverNo: string;
  name: string;
  phone: string;
  licenseType: string;
  city: string;
  status: string;
  rating: number;
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleTypeId: string;
  city: string;
  dailyPrice: number;
  status: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
};

export type Order = {
  id: string;
  orderNo: string;
  userId?: string;
  status: string;
  vehicleId: string;
  plateNumber?: string;
  vehicleTypeId?: string;
  city?: string;
  pickupTime?: string;
  returnTime?: string;
  estimatedFee: number;
  totalFee: number;
  paidAmount?: number;
  settlementMode: "PREPAID" | "POSTPAID";
  serviceMode: "SELF_DRIVE" | "WITH_DRIVER";
  billingAccountId?: string;
  billingPeriod?: string;
};

export type Bill = {
  id: string;
  billNo: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  billingPeriod: string;
};

export type BillPayment = {
  id: string;
  paymentNo: string;
  status: string;
  amount: number;
};

export type ReminderSummary = {
  totalVehicles: number;
  insuranceExpiringIn30Days: number;
  annualReviewExpiringIn30Days: number;
};

export type GpsRealtime = {
  vehicleId: string;
  lng: number;
  lat: number;
  speed: number;
  onlineStatus: "ONLINE" | "OFFLINE" | "UNKNOWN";
  locatedAt: string;
};

export type ViolationTaskSummary = {
  id: string;
  status: "PENDING" | "RUNNING" | "PARTIAL_SUCCESS" | "SUCCESS" | "FAILED";
  totalVehicles: number;
  totalCost: number;
  createdAt: string;
};
