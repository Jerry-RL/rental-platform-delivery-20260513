export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
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
  insuranceReminder?: VehicleReminderLevel;
  annualReviewReminder?: VehicleReminderLevel;
};

export type VehicleForm = {
  plateNumber: string;
  vehicleTypeId: string;
  city: string;
  dailyPrice: string;
  status: VehicleStatus;
  brand: string;
  model: string;
  vin: string;
  mileage: string;
  imageUrl: string;
  insuranceExpiryDate: string;
  annualReviewExpiryDate: string;
  remindBeforeDays: string;
};

export type Order = {
  id: string;
  orderNo: string;
  userId: string;
  vehicleId: string;
  plateNumber: string;
  vehicleTypeId: string;
  city: string;
  pickupTime: string;
  returnTime: string;
  status: string;
  settlementMode: "PREPAID" | "POSTPAID";
  serviceMode: "SELF_DRIVE" | "WITH_DRIVER";
  estimatedFee: number;
  totalFee: number;
  paidAmount: number;
};

export type UserStatus = "ACTIVE" | "SUSPENDED";

export type IndividualUser = {
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
  licenseReminder?: VehicleReminderLevel;
};

export type DriverForm = {
  name: string;
  phone: string;
  licenseNo: string;
  licenseType: string;
  city: string;
  status: DriverStatus;
  licenseImageUrl: string;
  licenseExpiryDate: string;
  remindBeforeDays: string;
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
