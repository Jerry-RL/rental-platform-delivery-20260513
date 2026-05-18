export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
};

export type UserStatus = "ACTIVE" | "SUSPENDED";

export type User = {
  id: string;
  phone: string;
  password: string;
  realName: string;
  licenseValid: boolean;
  status: UserStatus;
  registeredAt: string;
};

export type UserListItem = {
  id: string;
  phone: string;
  realName: string;
  licenseValid: boolean;
  status: UserStatus;
  registeredAt: string;
  orderCount: number;
};

export type EnterpriseAccountType = "B" | "G";
export type EnterpriseAccountStatus = "ACTIVE" | "SUSPENDED";

export type EnterpriseAccount = {
  id: string;
  accountNo: string;
  orgName: string;
  accountType: EnterpriseAccountType;
  contactName: string;
  contactPhone: string;
  creditLimit: number;
  status: EnterpriseAccountStatus;
  createdAt: string;
};

export type DriverStatus = "AVAILABLE" | "ON_DUTY" | "OFF_DUTY" | "SUSPENDED";

export type Driver = {
  id: string;
  driverNo: string;
  name: string;
  phone: string;
  licenseNo: string;
  licenseType: string;
  city: string;
  status: DriverStatus;
  rating: number;
  joinedAt: string;
  licenseImageUrl: string;
  licenseImages: string[];
  licenseExpiryDate: string;
  remindBeforeDays: number;
  updatedAt: string;
};

export type DriverDetail = Driver & {
  licenseReminder: VehicleReminderLevel;
};

export type PersonnelRole = "ADMIN" | "OPERATOR" | "FINANCE" | "CUSTOMER_SERVICE";
export type PersonnelStatus = "ACTIVE" | "INACTIVE";

export type Personnel = {
  id: string;
  employeeNo: string;
  name: string;
  phone: string;
  email?: string;
  role: PersonnelRole;
  department: string;
  status: PersonnelStatus;
  hiredAt: string;
};

export type VehicleStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE";
export type VehicleReminderLevel = "OK" | "EXPIRING_SOON" | "EXPIRED" | "UNKNOWN";

export type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleTypeId: string;
  city: string;
  dailyPrice: number;
  status: VehicleStatus;
  brand: string;
  model: string;
  vin: string;
  mileage: number;
  imageUrl: string;
  images: string[];
  insuranceExpiryDate: string;
  annualReviewExpiryDate: string;
  remindBeforeDays: number;
  createdAt: string;
  updatedAt: string;
};

export type VehicleDetail = Vehicle & {
  insuranceReminder: VehicleReminderLevel;
  annualReviewReminder: VehicleReminderLevel;
};

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "IN_USE"
  | "RETURN_PENDING_SETTLEMENT"
  | "SETTLED"
  | "COMPLETED"
  | "CANCELED";

export type SettlementMode = "PREPAID" | "POSTPAID";
export type ServiceMode = "SELF_DRIVE" | "WITH_DRIVER";

export type Order = {
  id: string;
  orderNo: string;
  userId: string;
  vehicleId: string;
  pickupStoreId: string;
  returnStoreId: string;
  pickupTime: string;
  returnTime: string;
  status: OrderStatus;
  settlementMode: SettlementMode;
  serviceMode: ServiceMode;
  billingAccountId?: string;
  billingPeriod?: string;
  accountType?: "C" | "B" | "G";
  driverId?: string;
  chauffeurFee: number;
  estimatedFee: number;
  totalFee: number;
  paidAmount: number;
};

export type OrderListItem = Order & {
  plateNumber: string;
  vehicleTypeId: string;
  city: string;
};

export type Payment = {
  id: string;
  orderId: string;
  channel: "alipay" | "wechat" | "bank";
  channelTxnNo: string;
  idempotencyKey?: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
};

export type BillStatus =
  | "PENDING_CONFIRM"
  | "PENDING_PAYMENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "PAYMENT_FAILED"
  | "OVERDUE";

export type Bill = {
  id: string;
  billNo: string;
  billingAccountId: string;
  accountType: "B" | "G";
  billingPeriod: string;
  totalAmount: number;
  paidAmount: number;
  status: BillStatus;
  dueDate?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  lastPaymentAt?: string;
  settledAt?: string;
  reconciliationStatus: "PENDING" | "DONE" | "FAILED";
};

export type BillPayment = {
  id: string;
  billId: string;
  paymentNo: string;
  channel: "bank" | "transfer" | "offline";
  channelTxnNo?: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  idempotencyKey: string;
  retryCount: number;
  nextRetryAt?: string;
  deadLetterReason?: string;
  paidAt?: string;
};

export type Invoice = {
  id: string;
  orderId: string;
  billId?: string;
  titleType: "PERSONAL" | "COMPANY";
  invoiceTitle: string;
  taxNo?: string;
  email?: string;
  amount: number;
  status: "CREATED";
};
