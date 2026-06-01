/** 与 OpenAPI gateway / 数据字典对齐的类型定义 */

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
};

export type PageResult<T> = {
  items: T[];
  pageNum: number;
  pageSize: number;
  total: number;
};

export type UserStatus = "ACTIVE" | "SUSPENDED" | "BLACKLIST";
/** SELF=C 端自助注册；ENTERPRISE=B/G 企业开通 */
export type UserRegistrationSource = "SELF" | "ENTERPRISE";
export type RealNameStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type LicenseStatus = "NONE" | "VALID" | "EXPIRED";
export type LicenseVerifyStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type User = {
  id: string;
  phone: string;
  realName: string;
  status: UserStatus;
  realNameStatus: RealNameStatus;
  licenseStatus: LicenseStatus;
  licenseVerifyStatus?: LicenseVerifyStatus;
  licenseType?: string;
  licenseExpiryDate?: string;
  registeredAt: string;
  registrationSource?: UserRegistrationSource;
};

/** 账户本人驾照 vs 订单内本次自驾司机驾照 */
export type UserLicenseRole = "ACCOUNT_HOLDER" | "SELF_DRIVE_DRIVER";

/** 对齐 user_license + OpenAPI SubmitLicenseRequest */
export type UserLicenseRecord = {
  id: string;
  userId: string;
  licenseNo: string;
  licenseClass: string;
  issueDate: string;
  expiryDate: string;
  licenseImageUrl?: string;
  licenseImageBackUrl?: string;
  verifyStatus: LicenseVerifyStatus;
  rejectReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  /** 默认 ACCOUNT_HOLDER；绑定车辆时为 SELF_DRIVE_DRIVER */
  role?: UserLicenseRole;
  /** 本次自驾司机姓名（SELF_DRIVE_DRIVER 必填） */
  driverName?: string;
  /** 自驾司机驾照绑定车辆 */
  vehicleId?: string;
  plateNumber?: string;
};

export type SubmitLicenseRequest = {
  licenseNo: string;
  licenseClass: string;
  issueDate: string;
  expiryDate: string;
  licenseImageUrl?: string;
  licenseImageBackUrl?: string;
  role?: UserLicenseRole;
  driverName?: string;
  vehicleId?: string;
  plateNumber?: string;
};

export type LicenseSlotStatus = "NONE" | "PENDING" | "REJECTED" | "EXPIRED" | "VALID";

export type LicenseVehicleSlot = {
  vehicleId: string;
  plateNumber?: string;
  driverName?: string;
  licenseId?: string;
  licenseNo?: string;
  slotStatus: LicenseSlotStatus;
  message: string;
};

export type SubmitRealnameRequest = {
  realName: string;
  idCardNo: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
};

export type EligibilitySnapshot = {
  snapshotId: string;
  eligible: boolean;
  realnameStatus: RealNameStatus;
  licenseStatus: LicenseStatus;
  licenseVerifyStatus?: LicenseVerifyStatus;
  licenseExpiryDate?: string;
  licenseClass?: string;
  blacklistFlag: boolean;
  orgStatus?: string;
  creditAvailable?: number;
  rejectReasons?: string[];
  message: string;
  /** 多台自驾资格 */
  selfDriveVehicleCount?: number;
  requiredLicenseCount?: number;
  approvedLicenseCount?: number;
  licenseSlots?: LicenseVehicleSlot[];
};

export type OrgAccountType = "B" | "G";
export type OrgAccountStatus = "PENDING" | "ACTIVE" | "FROZEN" | "CLOSED";

export type OrgAccount = {
  id: string;
  orgName: string;
  accountType: OrgAccountType;
  creditCode: string;
  status: OrgAccountStatus;
  creditLimit: number;
  usedAmount: number;
  billingPeriodDays: number;
  contactName: string;
  contactPhone: string;
  paymentReferenceCode?: string;
};

export type OrgMemberStatus = "PENDING" | "ACTIVE" | "DISABLED";

export type OrgMember = {
  id: string;
  orgId: string;
  userId: string;
  departmentName: string;
  roleCodes: string[];
  dataScope: "ORG" | "DEPT" | "SELF";
  status: OrgMemberStatus;
  /** H5 企业认证：成员留存的审批联系手机 */
  contactPhone?: string;
};

export type UpdateOrgMemberContactRequest = {
  contactPhone: string;
};

/** 管理端列表：成员 + 企业 + 用户摘要 */
export type OrgMemberEnriched = OrgMember & {
  orgName: string;
  accountType?: OrgAccountType;
  userPhone: string;
  userName: string;
  userStatus?: UserStatus;
};

export type OrgAccountDetail = {
  org: OrgAccount;
  members: OrgMemberEnriched[];
  stats: {
    memberCount: number;
    activeMemberCount: number;
    pendingApprovals: number;
    creditUsagePercent: number;
  };
};

export type ApprovalType = "MEMBER_OPEN" | "ROLE_CHANGE" | "BILL_CONFIRM";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type OrgApprovalTask = {
  id: string;
  orgId: string;
  approvalType: ApprovalType;
  targetMemberId: string;
  status: ApprovalStatus;
  reason?: string;
  createdAt: string;
};

export type VehicleStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "IN_USE"
  | "MAINTENANCE"
  | "ACCIDENT_HOLD"
  | "RETIRED";

export type MaintenanceReminderLevel = "OK" | "DUE_SOON" | "OVERDUE";

export type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleTypeId: string;
  city: string;
  storeId: string;
  dailyPrice: number;
  status: VehicleStatus;
  brand: string;
  model: string;
  vin: string;
  /** 当前里程 km，对齐 mileage_km */
  mileage: number;
  /** 上次保养里程 */
  lastMaintenanceMileageKm: number;
  /** 保养间隔 km，默认 10000 */
  maintenanceIntervalKm: number;
  lastMaintenanceAt?: string;
  gpsProvider?: "TUQIANG" | "CHENGZAI";
  imageUrl: string;
  /** 车辆展示图（首张为封面 imageUrl） */
  imageUrls?: string[];
  insuranceExpiryDate: string;
  annualReviewExpiryDate: string;
};

/** 车辆全生命周期轨迹事件（FR-VEH-006/007 + 订单履约） */
export type VehicleHistoryEventType =
  | "PURCHASE"
  | "MAINTENANCE"
  | "INSURANCE"
  | "REPAIR"
  | "ORDER"
  | "ANNUAL_REVIEW";

export type VehicleHistoryEvent = {
  id: string;
  vehicleId: string;
  plateNumber: string;
  eventType: VehicleHistoryEventType;
  title: string;
  summary: string;
  occurredAt: string;
  amount?: number;
  status?: string;
  refType?: "ORDER" | "MAINTENANCE" | "INSURANCE" | "ASSET";
  refId?: string;
};

export type VehicleHistoryTimeline = {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  vin: string;
  currentMileageKm: number;
  events: VehicleHistoryEvent[];
};

export type MaintenanceReminder = {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  currentMileageKm: number;
  lastMaintenanceMileageKm: number;
  nextDueMileageKm: number;
  kmUntilDue: number;
  level: MaintenanceReminderLevel;
  estimatedDueDate?: string;
};

export type MileageRecordSource = "ORDER_RETURN" | "MANUAL" | "GPS_SYNC";

export type MileageRecord = {
  id: string;
  vehicleId: string;
  plateNumber: string;
  mileageKm: number;
  previousMileageKm: number;
  deltaKm: number;
  source: MileageRecordSource;
  orderId?: string;
  recordedAt: string;
  recordedBy?: string;
};

export type MaintenanceOrderType = "ROUTINE" | "REPAIR";
export type MaintenanceOrderStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type MaintenanceOrder = {
  id: string;
  workOrderNo: string;
  vehicleId: string;
  plateNumber: string;
  orderType: MaintenanceOrderType;
  status: MaintenanceOrderStatus;
  title: string;
  description?: string;
  estimatedCost: number;
  actualCost?: number;
  scheduledAt: string;
  completedAt?: string;
  mileageAtService?: number;
  storeId: string;
};

export type ViolationQuota = {
  month: string;
  totalQuota: number;
  usedCount: number;
  unitCost: number;
};

export type Store = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
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
  | "CANCELED"
  /** 开票申请中（已结算后） */
  | "INVOICE_PENDING"
  /** 电子发票已开具 */
  | "INVOICE_ISSUED"
  /** 退款审核/处理中 */
  | "REFUND_PENDING"
  /** 部分退款完成 */
  | "REFUND_PARTIAL"
  /** 全额退款完成 */
  | "REFUND_SUCCESS";

export type SettlementMode = "PREPAID" | "POSTPAID";
/** 订单级服务方式：单车为自驾/包车；多车或分时段组合为 MIXED */
export type ServiceMode = "SELF_DRIVE" | "WITH_DRIVER" | "MIXED";

/** 单车在租车篮内仅允许自驾或包车（混合由多车组合体现） */
export type PerVehicleServiceMode = "SELF_DRIVE" | "WITH_DRIVER";

export type OrderLine = {
  id: string;
  orderId: string;
  vehicleId: string;
  plateNumber: string;
  vehicleTypeId: string;
  rentalFee: number;
  driverFee: number;
};

export type OrderFeeDetail = {
  id: string;
  orderId: string;
  feeType: string;
  amount: number;
  remark?: string;
};

export type Order = {
  id: string;
  orderNo: string;
  userId: string;
  vehicleId: string;
  plateNumber: string;
  vehicleTypeId: string;
  pickupStoreId: string;
  returnStoreId: string;
  pickupTime: string;
  returnTime: string;
  status: OrderStatus;
  settlementMode: SettlementMode;
  serviceMode: ServiceMode;
  accountType: "C" | "B" | "G";
  billingAccountId?: string;
  billingPeriod?: string;
  driverId?: string;
  chauffeurFee: number;
  estimatedFee: number;
  totalFee: number;
  paidAmount: number;
  incidentPending?: boolean;
  pricingRuleSnapshotId?: string;
  lines?: OrderLine[];
  feeDetails?: OrderFeeDetail[];
};

export type IncidentStatus =
  | "REPORTED"
  | "UNDER_REVIEW"
  | "INSURANCE_PROCESSING"
  | "RESOLVED"
  | "CLOSED";

export type InsuranceClaimStatus =
  | "NOT_REPORTED"
  | "REPORTED"
  | "ASSESSING"
  | "PAID"
  | "DENIED";

export type Incident = {
  id: string;
  orderId: string;
  vehicleId: string;
  plateNumber?: string;
  userId?: string;
  status: IncidentStatus;
  incidentType: string;
  location: string;
  /** 事故发生时间 */
  incidentAt?: string;
  reportedAt: string;
  reporterPhone?: string;
  description?: string;
  hasInjury?: boolean;
  policeReportNo?: string;
  insuranceStatus?: InsuranceClaimStatus;
  responsibleParty?: ViolationResponsibleParty;
  serviceContext?: ViolationServiceContext;
  vehicleHold?: boolean;
  handlerId?: string;
  estimatedCost: number;
  pauseBilling: boolean;
};

export type CreateIncidentReportRequest = {
  orderId: string;
  incidentAt: string;
  location: string;
  incidentType: string;
  reporterPhone: string;
  description?: string;
  hasInjury?: boolean;
  policeReportNo?: string;
  vehicleHold?: boolean;
  pauseBilling?: boolean;
};

export type UserIncidentView = Incident & {
  orderNo?: string;
  statusLabel: string;
  serviceContextLabel: string;
  responsiblePartyLabel: string;
  insuranceStatusLabel?: string;
};

export type UserIncidentSummary = {
  total: number;
  open: number;
  pauseBillingCount: number;
};

export type IncidentDetailRelations = {
  orderHref: string;
  vehicleHref: string | null;
  userHref: string | null;
};

export type IncidentDetail = {
  incident: UserIncidentView;
  order: {
    id: string;
    orderNo: string;
    status: OrderStatus;
    serviceMode: ServiceMode;
    pickupTime: string;
    returnTime: string;
    incidentPending?: boolean;
  } | null;
  vehicle: {
    id: string;
    plateNumber: string;
    brand: string;
    model: string;
    status: VehicleStatus;
  } | null;
  user: {
    id: string;
    realName: string;
    phone: string;
  } | null;
  relatedTickets: Array<{
    id: string;
    ticketNo: string;
    subject: string;
    status: ServiceTicket["status"];
    priority: ServiceTicket["priority"];
    createdAt: string;
  }>;
  relations: IncidentDetailRelations;
};

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";
export type PaymentChannel = "alipay" | "wechat" | "bank";

export type Payment = {
  id: string;
  orderId: string;
  billId?: string;
  channel: PaymentChannel;
  channelTxnNo: string;
  amount: number;
  status: PaymentStatus;
  settlementMode: SettlementMode;
  billingAccountId?: string;
  billingPeriod?: string;
  idempotencyKey?: string;
  createdAt: string;
};

export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export type Refund = {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
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
  dueDate: string;
  confirmedAt?: string;
  confirmedBy?: string;
  reconciliationStatus: "PENDING" | "DONE" | "FAILED";
  paymentReferenceCode: string;
};

export type BankTransaction = {
  id: string;
  txnNo: string;
  payerName: string;
  amount: number;
  referenceCode?: string;
  matchedBillId?: string;
  status: "UNMATCHED" | "MATCHED" | "PARTIAL";
  txnAt: string;
};

export type InvoiceStatus = "PENDING" | "ISSUED" | "FAILED";

export type Invoice = {
  id: string;
  orderId?: string;
  billId?: string;
  invoiceNo?: string;
  titleType: "PERSONAL" | "COMPANY";
  invoiceTitle: string;
  taxNo?: string;
  email?: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
};

export type TicketStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type ServiceTicket = {
  id: string;
  ticketNo: string;
  userId: string;
  orderId?: string;
  category: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  createdAt: string;
};

export type PricingRule = {
  id: string;
  name: string;
  billingMode: "TIME" | "MILEAGE" | "HYBRID";
  timeUnit: "HOUR" | "DAY" | "WEEK" | "MONTH";
  basePrice: number;
  includedKm: number;
  overKmPrice: number;
  serviceMode: ServiceMode;
  /** 适用车型（空=全车型） */
  vehicleTypeId?: string;
  /** 适用客户类型 */
  accountType?: "C" | "B" | "G" | "ALL";
  priority: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: "ACTIVE" | "INACTIVE";
  remark?: string;
};

export type OperatingCostEntry = {
  id: string;
  category: string;
  subCategory: string;
  amount: number;
  vehicleId?: string;
  orderId?: string;
  storeId?: string;
  period: string;
  status: "DRAFT" | "CONFIRMED" | "VOID";
  remark?: string;
  createdAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  name: string;
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  minOrderAmount: number;
  status: "ACTIVE" | "INACTIVE";
  validTo: string;
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
};

export type PersonnelRole = "ADMIN" | "OPERATOR" | "FINANCE" | "CUSTOMER_SERVICE";
export type PersonnelStatus = "ACTIVE" | "INACTIVE";

export type Personnel = {
  id: string;
  employeeNo: string;
  name: string;
  phone: string;
  role: PersonnelRole;
  department: string;
  storeScope: string[];
  status: PersonnelStatus;
};

export type ViolationTaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type ViolationBatchScope = "ALL_FLEET" | "FILTERED";
export type ViolationPaymentStatus = "UNPAID" | "PAID";
export type ViolationHandleStatus = "UNPROCESSED" | "IN_PROGRESS" | "PROCESSED" | "WAIVED";

export type ViolationBatchResultSummary = {
  queriedVehicles: number;
  dateFrom: string;
  dateTo: string;
  recentDaysOnly: boolean;
  newViolations: number;
  totalInRange: number;
  unpaidCount: number;
  unprocessedCount: number;
  inProgressCount: number;
  processedCount: number;
};

export type ViolationBatchTask = {
  id: string;
  taskNo: string;
  vehicleIds: string[];
  status: ViolationTaskStatus;
  provider: "SHUMAI";
  unitCost: number;
  totalCost: number;
  quotaMonth: string;
  createdAt: string;
  completedAt?: string;
  scope: ViolationBatchScope;
  dateFrom: string;
  dateTo: string;
  recentDaysOnly: boolean;
  recentDays?: number;
  filters?: { city?: string; vehicleStatus?: string };
  resultSummary?: ViolationBatchResultSummary;
};

/** 违章发生时的服务场景（与订单 serviceMode 对齐，租期外为 OUTSIDE_RENTAL） */
export type ViolationServiceContext =
  | "SELF_DRIVE"
  | "WITH_DRIVER"
  | "MIXED"
  | "OUTSIDE_RENTAL";

/** 责任主体（用户驾车违章规则） */
export type ViolationResponsibleParty =
  | "RENTER"
  | "ENTERPRISE"
  | "PLATFORM_DRIVER"
  | "UNKNOWN";

/** 对客追责与结算状态 */
export type ViolationLiabilityStatus =
  | "PENDING"
  | "CONFIRMED"
  | "BILLED"
  | "SETTLED"
  | "WAIVED";

export type ViolationRecord = {
  id: string;
  vehicleId: string;
  plateNumber: string;
  /** 包车服务期间可归因司机（运营手工或系统推断） */
  driverId?: string;
  /** 关联订单（租期内自动匹配） */
  orderId?: string;
  /** 下单用户 / 承租人（对客展示与追缴） */
  userId?: string;
  responsibleParty?: ViolationResponsibleParty;
  serviceContext?: ViolationServiceContext;
  liabilityStatus?: ViolationLiabilityStatus;
  /** 平台代办服务费（演示默认 50 元） */
  serviceFee?: number;
  /** 违章行为描述 */
  behavior?: string;
  violationTime: string;
  location: string;
  fineAmount: number;
  points: number;
  /** 缴款状态 */
  status: ViolationPaymentStatus;
  /** 运营处理状态 */
  handleStatus: ViolationHandleStatus;
  violationCode?: string;
  taskId?: string;
  processedAt?: string;
  processedBy?: string;
  remark?: string;
};

export type UserViolationView = ViolationRecord & {
  orderNo?: string;
  responsiblePartyLabel: string;
  liabilityStatusLabel: string;
  serviceContextLabel: string;
  totalDue: number;
};

export type ViolationSummary = {
  total: number;
  unpaid: number;
  paid: number;
  unprocessed: number;
  inProgress: number;
  processed: number;
  waived: number;
  recentCount: number;
  dateFrom?: string;
  dateTo?: string;
};

export type CreateViolationBatchRequest = {
  allFleet?: boolean;
  vehicleIds?: string[];
  city?: string;
  vehicleStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  recentDaysOnly?: boolean;
  recentDays?: number;
};

export type GpsSnapshot = {
  vehicleId: string;
  plateNumber: string;
  lat: number;
  lng: number;
  speed: number;
  online: boolean;
  provider: "TUQIANG" | "CHENGZAI";
  updatedAt: string;
};

export type MapPolicy = {
  id: string;
  scene: "BOOKING_PICKUP" | "GPS_TRACK";
  mode: "MAP_DIRECT" | "GPS_PASSTHROUGH";
  provider: string;
  commercialLicensed: boolean;
};

export type OpsDashboard = {
  revenue: { month: number; quarter: number; year: number };
  utilizationRate: number;
  activeOrders: number;
  overdueBills: number;
  incidentOpen: number;
  costMonth: number;
  grossMargin: number;
};

export type LoginRequest = { phone: string; password: string };
export type RegisterRequest = { phone: string; password: string; verifyCode: string };
export type ClientSegment = "C" | "B" | "G";

/** H5 登录后展示：C 端个人 vs B/G 端企业成员 */
export type AccountContext = {
  segment: ClientSegment;
  segmentLabel: string;
  /** B/G 须企业+成员认证；C 端为 false */
  requiresOrgAuth: boolean;
  /** 企业资质 + 成员账号 + 实名（B/G 门禁） */
  accountAuthOk: boolean;
  /** 是否允许进入选车/下单（不含自驾驾照，驾照另校验） */
  rentalAllowed: boolean;
  message: string;
  reasons: string[];
  realNameStatus: RealNameStatus;
  org?: {
    id: string;
    orgName: string;
    accountType: OrgAccountType;
    status: OrgAccountStatus;
    creditLimit: number;
    usedAmount: number;
    contactName: string;
    contactPhone: string;
  };
  member?: {
    id: string;
    status: OrgMemberStatus;
    departmentName: string;
    roleCodes: string[];
    contactPhone?: string;
  };
};

export type UserMeResponse = {
  user: User;
  account: AccountContext;
};

export type TokenData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: Pick<User, "id" | "phone" | "realName">;
  account?: AccountContext;
};

export type CreateOrderRequest = {
  vehicleTypeId?: string;
  vehicleId?: string;
  /** 按车款下单时用于匹配可租车辆 */
  brand?: string;
  model?: string;
  city?: string;
  vehicleQty?: number;
  pickupStoreId: string;
  returnStoreId: string;
  pickupTime: string;
  returnTime: string;
  settlementMode: SettlementMode;
  serviceMode: ServiceMode;
  billingAccountId?: string;
  driverId?: string;
  billingMode?: "TIME" | "MILEAGE" | "HYBRID";
  timeUnit?: "HOUR" | "DAY" | "WEEK" | "MONTH";
  estimatedKm?: number;
  couponCode?: string;
  quoteId?: string;
};

export type CreatePaymentRequest = {
  orderId: string;
  amount: number;
  channel: PaymentChannel;
  settlementMode: SettlementMode;
  billingAccountId?: string;
  billingPeriod?: string;
};

export type CreateInvoiceRequest = {
  orderId?: string;
  billId?: string;
  titleType: "PERSONAL" | "COMPANY";
  invoiceTitle: string;
  taxNo?: string;
  email?: string;
};

export type ConfirmBillRequest = { confirmedBy: string; confirmRemark?: string };
