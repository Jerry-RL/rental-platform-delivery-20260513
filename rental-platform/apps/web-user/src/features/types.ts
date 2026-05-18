export type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleTypeId: string;
  city: string;
  dailyPrice: number;
  status: string;
};

export type Order = {
  id: string;
  orderNo: string;
  status: string;
  vehicleId: string;
  estimatedFee: number;
  totalFee: number;
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
