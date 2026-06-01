import type {
  BankTransaction,
  Bill,
  Coupon,
  Driver,
  GpsSnapshot,
  Incident,
  Invoice,
  MapPolicy,
  OperatingCostEntry,
  OpsDashboard,
  Order,
  OrgAccount,
  OrgApprovalTask,
  OrgMember,
  Payment,
  Personnel,
  PricingRule,
  Refund,
  ServiceTicket,
  Store,
  User,
  UserLicenseRecord,
  Vehicle,
  VehicleHistoryEvent,
  MaintenanceOrder,
  MileageRecord,
  ViolationBatchTask,
  ViolationQuota,
  ViolationRecord
} from "./types";
import { generateFleetSeed } from "./seed-fleet";

export const IDS = {
  userC: "a1000001-0001-4000-8000-000000000001",
  userB: "a1000001-0001-4000-8000-000000000002",
  userG: "a1000001-0001-4000-8000-000000000003",
  orgB: "b2000001-0001-4000-8000-000000000001",
  orgG: "b2000001-0001-4000-8000-000000000002",
  storeSh: "c3000001-0001-4000-8000-000000000001",
  storeBj: "c3000001-0001-4000-8000-000000000002",
  vehicle1: "d4000001-0001-4000-8000-000000000001",
  vehicle2: "d4000001-0001-4000-8000-000000000002",
  vehicle3: "d4000001-0001-4000-8000-000000000003",
  orderPrepaid: "e5000001-0001-4000-8000-000000000001",
  orderInUse: "e5000001-0001-4000-8000-000000000002",
  orderPostpaid: "e5000001-0001-4000-8000-000000000003",
  orderSettle: "e5000001-0001-4000-8000-000000000004",
  orderCompleted: "e5000001-0001-4000-8000-000000000005",
  orderRefundOk: "e5000001-0001-4000-8000-000000000006",
  orderAwaitPickup: "e5000001-0001-4000-8000-000000000007",
  orderAwaitChauffeur: "e5000001-0001-4000-8000-000000000008",
  billB: "f6000001-0001-4000-8000-000000000001",
  driver1: "g7000001-0001-4000-8000-000000000001",
  driver2: "g7000001-0001-4000-8000-000000000002",
  orderDriver1Done: "e5000001-0001-4000-8000-000000000009",
  orderDriver2Done: "e5000001-0001-4000-8000-000000000010",
  incident1: "h8000001-0001-4000-8000-000000000001"
} as const;

const now = "2026-05-28T10:00:00.000Z";

export const seedUsers: User[] = [
  {
    id: IDS.userC,
    phone: "13800138000",
    realName: "李明",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "VALID",
    licenseVerifyStatus: "APPROVED",
    licenseType: "C1",
    licenseExpiryDate: "2028-06-30",
    registeredAt: "2026-01-15T08:00:00.000Z",
    registrationSource: "SELF"
  },
  {
    id: IDS.userB,
    phone: "13900139000",
    realName: "王芳",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "VALID",
    licenseVerifyStatus: "APPROVED",
    licenseType: "C1",
    licenseExpiryDate: "2027-12-31",
    registeredAt: "2026-02-01T08:00:00.000Z",
    registrationSource: "ENTERPRISE"
  },
  {
    id: IDS.userG,
    phone: "13700137000",
    realName: "赵强",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "VALID",
    licenseVerifyStatus: "APPROVED",
    licenseType: "C1",
    licenseExpiryDate: "2028-03-01",
    registeredAt: "2026-03-01T08:00:00.000Z",
    registrationSource: "ENTERPRISE"
  },
  {
    id: "a1000001-0001-4000-8000-000000000098",
    phone: "13600136098",
    realName: "周过期",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "EXPIRED",
    licenseVerifyStatus: "APPROVED",
    licenseType: "C1",
    licenseExpiryDate: "2025-12-01",
    registeredAt: "2026-04-01T08:00:00.000Z",
    registrationSource: "SELF"
  },
  {
    id: "a1000001-0001-4000-8000-000000000010",
    phone: "13500135001",
    realName: "陈业务",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "VALID",
    licenseVerifyStatus: "APPROVED",
    licenseType: "C1",
    licenseExpiryDate: "2028-01-15",
    registeredAt: "2026-04-10T08:00:00.000Z",
    registrationSource: "ENTERPRISE"
  },
  {
    id: "a1000001-0001-4000-8000-000000000099",
    phone: "13600136000",
    realName: "待审用户",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "NONE",
    licenseVerifyStatus: "PENDING",
    licenseType: "C1",
    licenseExpiryDate: "2027-08-01",
    registeredAt: "2026-05-20T08:00:00.000Z",
    registrationSource: "ENTERPRISE"
  },
  {
    id: "a1000001-0001-4000-8000-000000000097",
    phone: "13600136097",
    realName: "新用户",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "NONE",
    licenseVerifyStatus: "NONE",
    registeredAt: "2026-05-28T08:00:00.000Z",
    registrationSource: "SELF"
  },
  {
    id: "a1000001-0001-4000-8000-000000000096",
    phone: "13600136096",
    realName: "吴驳回",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "NONE",
    licenseVerifyStatus: "REJECTED",
    licenseType: "C2",
    licenseExpiryDate: "2029-02-01",
    registeredAt: "2026-05-01T08:00:00.000Z",
    registrationSource: "SELF"
  },
  /** 管理端演示工号（与 seedPersonnel 同 id/手机号，可登录 users/login） */
  {
    id: "p1000001-0001-4000-8000-000000000001",
    phone: "13800001001",
    realName: "陈运营",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "NONE",
    licenseVerifyStatus: "NONE",
    registeredAt: "2025-01-01T08:00:00.000Z",
    registrationSource: "SELF"
  },
  {
    id: "p1000001-0001-4000-8000-000000000002",
    phone: "13800001002",
    realName: "周财务",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "NONE",
    licenseVerifyStatus: "NONE",
    registeredAt: "2025-01-01T08:00:00.000Z",
    registrationSource: "SELF"
  },
  {
    id: "p1000001-0001-4000-8000-000000000004",
    phone: "13800001004",
    realName: "刘客服",
    status: "ACTIVE",
    realNameStatus: "APPROVED",
    licenseStatus: "NONE",
    licenseVerifyStatus: "NONE",
    registeredAt: "2025-01-01T08:00:00.000Z",
    registrationSource: "SELF"
  }
];

export const seedUserLicenses: UserLicenseRecord[] = [
  {
    id: "lic-001",
    userId: IDS.userC,
    licenseNo: "310101199205151234",
    licenseClass: "C1",
    issueDate: "2014-06-01",
    expiryDate: "2028-06-30",
    licenseImageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600",
    verifyStatus: "APPROVED",
    submittedAt: "2026-01-20T08:00:00.000Z",
    reviewedAt: "2026-01-21T10:00:00.000Z"
  },
  {
    id: "lic-002",
    userId: IDS.userB,
    licenseNo: "310101198803031122",
    licenseClass: "C1",
    issueDate: "2010-03-15",
    expiryDate: "2027-12-31",
    verifyStatus: "APPROVED",
    submittedAt: "2026-02-05T08:00:00.000Z",
    reviewedAt: "2026-02-06T09:00:00.000Z"
  },
  {
    id: "lic-003",
    userId: IDS.userG,
    licenseNo: "110101197906061133",
    licenseClass: "C1",
    issueDate: "2012-08-20",
    expiryDate: "2028-03-01",
    verifyStatus: "APPROVED",
    submittedAt: "2026-03-02T08:00:00.000Z",
    reviewedAt: "2026-03-03T11:00:00.000Z"
  },
  {
    id: "lic-pending",
    userId: "a1000001-0001-4000-8000-000000000099",
    licenseNo: "310101199801011199",
    licenseClass: "C1",
    issueDate: "2018-05-01",
    expiryDate: "2027-08-01",
    licenseImageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600",
    verifyStatus: "PENDING",
    submittedAt: "2026-05-26T14:00:00.000Z"
  },
  {
    id: "lic-expired",
    userId: "a1000001-0001-4000-8000-000000000098",
    licenseNo: "310101199303031188",
    licenseClass: "C1",
    issueDate: "2013-01-10",
    expiryDate: "2025-12-01",
    verifyStatus: "APPROVED",
    submittedAt: "2024-01-10T08:00:00.000Z",
    reviewedAt: "2024-01-11T09:00:00.000Z"
  },
  {
    id: "lic-rejected",
    userId: "a1000001-0001-4000-8000-000000000096",
    licenseNo: "310101199001011166",
    licenseClass: "C2",
    issueDate: "2019-02-01",
    expiryDate: "2029-02-01",
    verifyStatus: "REJECTED",
    rejectReason: "准驾车型与所选车辆不匹配，请上传 C1 及以上驾照",
    submittedAt: "2026-05-10T08:00:00.000Z",
    reviewedAt: "2026-05-11T16:00:00.000Z"
  }
];

export const seedOrgs: OrgAccount[] = [
  {
    id: IDS.orgB,
    orgName: "华东物流有限公司",
    accountType: "B",
    creditCode: "91310000MA1K3XXXX",
    status: "ACTIVE",
    creditLimit: 500000,
    usedAmount: 128600,
    billingPeriodDays: 30,
    contactName: "王芳",
    contactPhone: "13900139000",
    paymentReferenceCode: "HZWL-202605-BILL"
  },
  {
    id: IDS.orgG,
    orgName: "某市机关事务管理局",
    accountType: "G",
    creditCode: "11110000MB0XXXXXX",
    status: "ACTIVE",
    creditLimit: 800000,
    usedAmount: 45200,
    billingPeriodDays: 45,
    contactName: "赵强",
    contactPhone: "13700137000",
    paymentReferenceCode: "GOV-SH-202605"
  }
];

export const seedOrgMembers: OrgMember[] = [
  {
    id: "m1000001-0001-4000-8000-000000000001",
    orgId: IDS.orgB,
    userId: IDS.userB,
    departmentName: "行政部",
    roleCodes: ["ORG_ADMIN", "BILL_CONFIRM"],
    dataScope: "ORG",
    status: "ACTIVE"
  },
  {
    id: "m1000001-0001-4000-8000-000000000002",
    orgId: IDS.orgB,
    userId: "a1000001-0001-4000-8000-000000000010",
    departmentName: "业务部",
    roleCodes: ["ORDER_CREATE"],
    dataScope: "DEPT",
    status: "ACTIVE"
  },
  {
    id: "m1000001-0001-4000-8000-000000000003",
    orgId: IDS.orgG,
    userId: IDS.userG,
    departmentName: "车队管理科",
    roleCodes: ["ORG_ADMIN", "ORDER_CREATE"],
    dataScope: "ORG",
    status: "ACTIVE"
  },
  {
    id: "m1000001-0001-4000-8000-000000000004",
    orgId: IDS.orgB,
    userId: "a1000001-0001-4000-8000-000000000099",
    departmentName: "财务部",
    roleCodes: ["FINANCE", "BILL_CONFIRM"],
    dataScope: "DEPT",
    status: "PENDING"
  }
];

export const seedApprovals: OrgApprovalTask[] = [
  {
    id: "ap100001-0001-4000-8000-000000000001",
    orgId: IDS.orgB,
    approvalType: "BILL_CONFIRM",
    targetMemberId: "m1000001-0001-4000-8000-000000000001",
    status: "PENDING",
    reason: "2026-05 月结账单确认",
    createdAt: "2026-05-27T09:00:00.000Z"
  },
  {
    id: "ap100001-0001-4000-8000-000000000002",
    orgId: IDS.orgB,
    approvalType: "MEMBER_OPEN",
    targetMemberId: "m1000001-0001-4000-8000-000000000004",
    status: "PENDING",
    reason: "财务部新成员开通企业账号",
    createdAt: "2026-05-28T08:00:00.000Z"
  }
];

const fleetBundle = generateFleetSeed(5);

/** 演示锚点车辆（与订单/事故联调） */
const coreVehicles: Vehicle[] = [
  {
    id: IDS.vehicle1,
    plateNumber: "沪A12345",
    vehicleTypeId: "SUV",
    city: "上海",
    storeId: IDS.storeSh,
    dailyPrice: 399,
    status: "AVAILABLE",
    brand: "丰田",
    model: "RAV4",
    vin: "LVHRM1828N5001234",
    mileage: 28800,
    lastMaintenanceMileageKm: 20000,
    maintenanceIntervalKm: 10000,
    lastMaintenanceAt: "2026-02-15",
    gpsProvider: "TUQIANG",
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce5357ab85?w=400",
    insuranceExpiryDate: "2026-08-15",
    annualReviewExpiryDate: "2026-09-01",
    purchaseDate: "2022-03-10",
    scrapMileageLimitKm: 120_000,
    maxServiceYears: 8
  },
  {
    id: IDS.vehicle2,
    plateNumber: "沪B98765",
    vehicleTypeId: "SEDAN",
    city: "上海",
    storeId: IDS.storeSh,
    dailyPrice: 299,
    status: "ACCIDENT_HOLD",
    brand: "大众",
    model: "帕萨特",
    vin: "LVSHCAMB8NN045678",
    mileage: 15200,
    lastMaintenanceMileageKm: 10000,
    maintenanceIntervalKm: 10000,
    lastMaintenanceAt: "2026-01-10",
    gpsProvider: "CHENGZAI",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
    insuranceExpiryDate: "2026-06-20",
    annualReviewExpiryDate: "2026-09-01",
    purchaseDate: "2021-08-15",
    scrapMileageLimitKm: 120_000,
    maxServiceYears: 8
  },
  {
    id: IDS.vehicle3,
    plateNumber: "京C66889",
    vehicleTypeId: "SUV",
    city: "北京",
    storeId: IDS.storeBj,
    dailyPrice: 429,
    status: "MAINTENANCE",
    brand: "本田",
    model: "CR-V",
    vin: "LVHGD1865N8009012",
    mileage: 112_500,
    lastMaintenanceMileageKm: 105_000,
    maintenanceIntervalKm: 10000,
    lastMaintenanceAt: "2026-04-01",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400",
    insuranceExpiryDate: "2026-04-01",
    annualReviewExpiryDate: "2026-07-01",
    purchaseDate: "2018-05-20",
    scrapMileageLimitKm: 120_000,
    maxServiceYears: 8
  },
  {
    id: "d4000001-0001-4000-8000-000000000004",
    plateNumber: "沪D11223",
    vehicleTypeId: "MPV",
    city: "上海",
    storeId: IDS.storeSh,
    dailyPrice: 499,
    status: "ACCIDENT_HOLD",
    brand: "别克",
    model: "GL8",
    vin: "LVSHCAAJ8NN011223",
    mileage: 108_200,
    lastMaintenanceMileageKm: 100_000,
    maintenanceIntervalKm: 10000,
    lastMaintenanceAt: "2025-11-20",
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400",
    insuranceExpiryDate: "2026-10-01",
    annualReviewExpiryDate: "2026-08-01",
    purchaseDate: "2017-11-01",
    scrapMileageLimitKm: 120_000,
    maxServiceYears: 8
  }
];

export const seedStores: Store[] = [
  {
    id: IDS.storeSh,
    name: "上海虹桥店",
    city: "上海",
    address: "闵行区申虹路 88 号",
    phone: "021-88886666"
  },
  {
    id: IDS.storeBj,
    name: "北京朝阳店",
    city: "北京",
    address: "朝阳区建国路 100 号",
    phone: "010-66668888"
  },
  ...fleetBundle.extraStores
];

/** 共 200 台：4 台演示车 + 196 台生成车队 */
export const seedVehicles: Vehicle[] = [...coreVehicles, ...fleetBundle.fleetVehicles];

/** 车辆生命周期锚点事件（其余车辆由 buildVehicleHistory 合成） */
export const seedVehicleHistoryEvents: VehicleHistoryEvent[] = [
  {
    id: "hist-purchase-v1",
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    eventType: "PURCHASE",
    title: "车辆采购入库",
    summary: "丰田 RAV4 2023 款 · 上海虹桥店配车 · 含购置税",
    occurredAt: "2023-06-18T10:00:00.000Z",
    amount: 218800,
    status: "已入库",
    refType: "ASSET",
    refId: IDS.vehicle1
  },
  {
    id: "hist-ins-v1-2025",
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    eventType: "INSURANCE",
    title: "商业险续保",
    summary: "平安车险 · 车损+三者200万+座位险",
    occurredAt: "2025-08-10T08:00:00.000Z",
    amount: 5680,
    status: "已生效",
    refType: "INSURANCE",
    refId: "pol-v1-2025"
  },
  {
    id: "hist-maint-v1-2026-02",
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    eventType: "MAINTENANCE",
    title: "常规保养完成",
    summary: "20000km 机油机滤+空滤 · 上海虹桥店",
    occurredAt: "2026-02-15T16:00:00.000Z",
    amount: 720,
    status: "已完成",
    refType: "MAINTENANCE",
    refId: "mo-hist-v1"
  },
  {
    id: "hist-purchase-v2",
    vehicleId: IDS.vehicle2,
    plateNumber: "沪B98765",
    eventType: "PURCHASE",
    title: "车辆采购入库",
    summary: "大众帕萨特 2022 款 · 营运租赁资质办理",
    occurredAt: "2022-11-05T10:00:00.000Z",
    amount: 186000,
    status: "已入库",
    refType: "ASSET",
    refId: IDS.vehicle2
  },
  {
    id: "hist-repair-v2-2025",
    vehicleId: IDS.vehicle2,
    plateNumber: "沪B98765",
    eventType: "REPAIR",
    title: "事故维修",
    summary: "右侧钣金喷漆 · 关联订单事故待结",
    occurredAt: "2025-12-08T14:00:00.000Z",
    amount: 3200,
    status: "已完成",
    refType: "MAINTENANCE",
    refId: "mo-hist-v2"
  },
  {
    id: "hist-purchase-v3",
    vehicleId: IDS.vehicle3,
    plateNumber: "京C66889",
    eventType: "PURCHASE",
    title: "车辆采购入库",
    summary: "本田 CR-V 2021 款 · 北京朝阳店",
    occurredAt: "2021-09-22T10:00:00.000Z",
    amount: 195000,
    status: "已入库",
    refType: "ASSET",
    refId: IDS.vehicle3
  },
  {
    id: "hist-ins-v3-expired",
    vehicleId: IDS.vehicle3,
    plateNumber: "京C66889",
    eventType: "INSURANCE",
    title: "保险到期未续",
    summary: "保单已于 2026-04-01 到期 · 需停驶直至续保",
    occurredAt: "2026-04-01T00:00:00.000Z",
    amount: 0,
    status: "已过期",
    refType: "INSURANCE",
    refId: "pol-v3-exp"
  }
];

export const seedOrders: Order[] = [
  {
    id: IDS.orderPrepaid,
    orderNo: "ORD20260528001",
    userId: IDS.userC,
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    vehicleTypeId: "SUV",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeSh,
    pickupTime: "2026-06-01T09:00:00.000Z",
    returnTime: "2026-06-03T18:00:00.000Z",
    status: "PENDING_PAYMENT",
    settlementMode: "PREPAID",
    serviceMode: "SELF_DRIVE",
    accountType: "C",
    chauffeurFee: 0,
    estimatedFee: 1197,
    totalFee: 1197,
    paidAmount: 0,
    pricingRuleSnapshotId: "prc-001",
    feeDetails: [{ id: "fd-prepaid-1", orderId: IDS.orderPrepaid, feeType: "RENTAL", amount: 1197 }]
  },
  {
    id: IDS.orderInUse,
    orderNo: "ORD20260515002",
    userId: IDS.userC,
    vehicleId: IDS.vehicle2,
    plateNumber: "沪B98765",
    vehicleTypeId: "SEDAN",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeSh,
    pickupTime: "2026-05-15T10:00:00.000Z",
    returnTime: "2026-05-28T18:00:00.000Z",
    status: "IN_USE",
    settlementMode: "PREPAID",
    serviceMode: "SELF_DRIVE",
    accountType: "C",
    chauffeurFee: 0,
    estimatedFee: 3887,
    totalFee: 3887,
    paidAmount: 1200,
    incidentPending: true,
    pricingRuleSnapshotId: "prc-001",
    feeDetails: [
      { id: "fd-inuse-1", orderId: IDS.orderInUse, feeType: "RENTAL", amount: 2687 },
      { id: "fd-inuse-2", orderId: IDS.orderInUse, feeType: "DEPOSIT", amount: 1200, remark: "已付押金" }
    ]
  },
  {
    id: IDS.orderPostpaid,
    orderNo: "ORD20260520003",
    userId: IDS.userB,
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    vehicleTypeId: "SUV",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeBj,
    pickupTime: "2026-05-20T08:00:00.000Z",
    returnTime: "2026-05-25T20:00:00.000Z",
    status: "CONFIRMED",
    settlementMode: "POSTPAID",
    serviceMode: "WITH_DRIVER",
    accountType: "B",
    billingAccountId: IDS.orgB,
    billingPeriod: "2026-05",
    driverId: IDS.driver1,
    chauffeurFee: 800,
    estimatedFee: 2795,
    totalFee: 2795,
    paidAmount: 0,
    pricingRuleSnapshotId: "prc-002",
    feeDetails: [
      { id: "fd-b-1", orderId: IDS.orderPostpaid, feeType: "RENTAL", amount: 1995 },
      { id: "fd-b-2", orderId: IDS.orderPostpaid, feeType: "DRIVER", amount: 800 }
    ]
  },
  {
    id: IDS.orderSettle,
    orderNo: "ORD20260501004",
    userId: IDS.userG,
    vehicleId: "d4000001-0001-4000-8000-000000000004",
    plateNumber: "沪D11223",
    vehicleTypeId: "MPV",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeSh,
    pickupTime: "2026-05-01T08:00:00.000Z",
    returnTime: "2026-05-10T18:00:00.000Z",
    status: "RETURN_PENDING_SETTLEMENT",
    settlementMode: "POSTPAID",
    serviceMode: "WITH_DRIVER",
    accountType: "G",
    billingAccountId: IDS.orgG,
    billingPeriod: "2026-05",
    driverId: IDS.driver1,
    chauffeurFee: 1200,
    estimatedFee: 6190,
    totalFee: 6450,
    paidAmount: 0,
    feeDetails: [
      { id: "fd1", orderId: IDS.orderSettle, feeType: "RENTAL", amount: 4990 },
      { id: "fd2", orderId: IDS.orderSettle, feeType: "DRIVER", amount: 1200 },
      { id: "fd3", orderId: IDS.orderSettle, feeType: "OVER_KM", amount: 160, remark: "超公里 80km" },
      { id: "fd4", orderId: IDS.orderSettle, feeType: "CROSS_STORE", amount: 100, remark: "异店还车" }
    ]
  },
  {
    id: IDS.orderCompleted,
    orderNo: "ORD20260428005",
    userId: IDS.userC,
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    vehicleTypeId: "SUV",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeSh,
    pickupTime: "2026-04-20T08:00:00.000Z",
    returnTime: "2026-04-25T18:00:00.000Z",
    status: "COMPLETED",
    settlementMode: "PREPAID",
    serviceMode: "SELF_DRIVE",
    accountType: "C",
    chauffeurFee: 0,
    estimatedFee: 1995,
    totalFee: 1995,
    paidAmount: 1995,
    pricingRuleSnapshotId: "prc-001",
    feeDetails: [{ id: "fd-done-1", orderId: IDS.orderCompleted, feeType: "RENTAL", amount: 1995 }]
  },
  {
    id: IDS.orderAwaitPickup,
    orderNo: "ORD20260530007",
    userId: IDS.userC,
    vehicleId: IDS.vehicle3,
    plateNumber: "京C66889",
    vehicleTypeId: "SUV",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeSh,
    pickupTime: "2026-06-02T10:00:00.000Z",
    returnTime: "2026-06-05T18:00:00.000Z",
    status: "CONFIRMED",
    settlementMode: "PREPAID",
    serviceMode: "SELF_DRIVE",
    accountType: "C",
    chauffeurFee: 0,
    estimatedFee: 1197,
    totalFee: 1197,
    paidAmount: 1197,
    pricingRuleSnapshotId: "prc-001",
    feeDetails: [{ id: "fd-await-1", orderId: IDS.orderAwaitPickup, feeType: "RENTAL", amount: 1197 }]
  },
  {
    id: IDS.orderAwaitChauffeur,
    orderNo: "ORD20260530008",
    userId: IDS.userC,
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    vehicleTypeId: "SUV",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeSh,
    pickupTime: "2026-06-03T08:00:00.000Z",
    returnTime: "2026-06-06T20:00:00.000Z",
    status: "CONFIRMED",
    settlementMode: "PREPAID",
    serviceMode: "WITH_DRIVER",
    accountType: "C",
    driverId: IDS.driver1,
    chauffeurFee: 600,
    estimatedFee: 2397,
    totalFee: 2397,
    paidAmount: 2397,
    pricingRuleSnapshotId: "prc-002",
    feeDetails: [
      { id: "fd-chauf-1", orderId: IDS.orderAwaitChauffeur, feeType: "RENTAL", amount: 1797 },
      { id: "fd-chauf-2", orderId: IDS.orderAwaitChauffeur, feeType: "DRIVER", amount: 600 }
    ]
  },
  {
    id: IDS.orderDriver1Done,
    orderNo: "ORD20260512009",
    userId: IDS.userB,
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    vehicleTypeId: "SUV",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeSh,
    pickupTime: "2026-05-12T08:00:00.000Z",
    returnTime: "2026-05-19T20:00:00.000Z",
    status: "COMPLETED",
    settlementMode: "PREPAID",
    serviceMode: "WITH_DRIVER",
    accountType: "B",
    billingAccountId: IDS.orgB,
    driverId: IDS.driver1,
    chauffeurFee: 560,
    estimatedFee: 2155,
    totalFee: 2155,
    paidAmount: 2155,
    pricingRuleSnapshotId: "prc-002",
    feeDetails: [
      { id: "fd-d1-1", orderId: IDS.orderDriver1Done, feeType: "RENTAL", amount: 1595 },
      { id: "fd-d1-2", orderId: IDS.orderDriver1Done, feeType: "DRIVER", amount: 560 }
    ]
  },
  {
    id: IDS.orderDriver2Done,
    orderNo: "ORD20260415010",
    userId: IDS.userG,
    vehicleId: IDS.vehicle2,
    plateNumber: "沪B98765",
    vehicleTypeId: "SEDAN",
    pickupStoreId: IDS.storeSh,
    returnStoreId: IDS.storeSh,
    pickupTime: "2026-04-15T08:00:00.000Z",
    returnTime: "2026-04-22T18:00:00.000Z",
    status: "COMPLETED",
    settlementMode: "POSTPAID",
    serviceMode: "WITH_DRIVER",
    accountType: "G",
    billingAccountId: IDS.orgG,
    billingPeriod: "2026-04",
    driverId: IDS.driver2,
    chauffeurFee: 480,
    estimatedFee: 1680,
    totalFee: 1680,
    paidAmount: 1680,
    pricingRuleSnapshotId: "prc-002",
    feeDetails: [
      { id: "fd-d2-1", orderId: IDS.orderDriver2Done, feeType: "RENTAL", amount: 1200 },
      { id: "fd-d2-2", orderId: IDS.orderDriver2Done, feeType: "DRIVER", amount: 480 }
    ]
  },
  {
    id: IDS.orderRefundOk,
    orderNo: "ORD20260315006",
    userId: IDS.userC,
    vehicleId: IDS.vehicle3,
    plateNumber: "京C66889",
    vehicleTypeId: "SUV",
    pickupStoreId: IDS.storeBj,
    returnStoreId: IDS.storeBj,
    pickupTime: "2026-03-10T09:00:00.000Z",
    returnTime: "2026-03-12T18:00:00.000Z",
    status: "COMPLETED",
    settlementMode: "PREPAID",
    serviceMode: "SELF_DRIVE",
    accountType: "C",
    chauffeurFee: 0,
    estimatedFee: 798,
    totalFee: 798,
    paidAmount: 798,
    pricingRuleSnapshotId: "prc-001",
    feeDetails: [{ id: "fd-ref-1", orderId: IDS.orderRefundOk, feeType: "RENTAL", amount: 798 }]
  }
];

export const seedPayments: Payment[] = [
  {
    id: "pay-001",
    orderId: IDS.orderInUse,
    channel: "wechat",
    channelTxnNo: "WX20260515001",
    amount: 1200,
    status: "SUCCESS",
    settlementMode: "PREPAID",
    createdAt: "2026-05-15T10:05:00.000Z"
  },
  {
    id: "pay-002",
    orderId: IDS.orderPrepaid,
    channel: "alipay",
    channelTxnNo: "",
    amount: 1197,
    status: "PENDING",
    settlementMode: "PREPAID",
    createdAt: now
  }
];

export const seedRefunds: Refund[] = [
  {
    id: "ref-001",
    orderId: IDS.orderInUse,
    amount: 200,
    reason: "提前还车差额",
    status: "PENDING",
    createdAt: "2026-05-27T14:00:00.000Z"
  },
  {
    id: "ref-002",
    orderId: IDS.orderRefundOk,
    amount: 798,
    reason: "行程取消全额退",
    status: "COMPLETED",
    createdAt: "2026-03-13T10:00:00.000Z"
  }
];

export const seedBills: Bill[] = [
  {
    id: IDS.billB,
    billNo: "BILL202605-B-001",
    billingAccountId: IDS.orgB,
    accountType: "B",
    billingPeriod: "2026-05",
    totalAmount: 128600,
    paidAmount: 50000,
    status: "PARTIALLY_PAID",
    dueDate: "2026-06-15",
    confirmedAt: "2026-05-25T10:00:00.000Z",
    confirmedBy: IDS.userB,
    reconciliationStatus: "PENDING",
    paymentReferenceCode: "HZWL-202605-BILL"
  },
  {
    id: "f6000001-0001-4000-8000-000000000002",
    billNo: "BILL202605-G-001",
    billingAccountId: IDS.orgG,
    accountType: "G",
    billingPeriod: "2026-05",
    totalAmount: 45200,
    paidAmount: 0,
    status: "PENDING_CONFIRM",
    dueDate: "2026-06-30",
    reconciliationStatus: "PENDING",
    paymentReferenceCode: "GOV-SH-202605"
  }
];

export const seedBankTxns: BankTransaction[] = [
  {
    id: "bt-001",
    txnNo: "BK20260526001",
    payerName: "华东物流有限公司",
    amount: 50000,
    referenceCode: "HZWL-202605-BILL",
    matchedBillId: IDS.billB,
    status: "MATCHED",
    txnAt: "2026-05-26T15:30:00.000Z"
  },
  {
    id: "bt-002",
    txnNo: "BK20260528001",
    payerName: "未知付款方",
    amount: 12000,
    status: "UNMATCHED",
    txnAt: "2026-05-28T09:00:00.000Z"
  }
];

export const seedInvoices: Invoice[] = [
  {
    id: "inv-order-done",
    orderId: IDS.orderCompleted,
    titleType: "PERSONAL",
    invoiceTitle: "张三",
    amount: 1995,
    status: "ISSUED",
    invoiceNo: "INV20260428005",
    email: "zhang@example.com",
    createdAt: "2026-04-26T11:00:00.000Z"
  },
  {
    id: "inv-001",
    orderId: "e5000001-0001-4000-8000-000000000099",
    titleType: "COMPANY",
    invoiceTitle: "华东物流有限公司",
    taxNo: "91310000MA1K3XXXX",
    amount: 3580,
    status: "ISSUED",
    invoiceNo: "INV2026050001",
    createdAt: "2026-05-10T11:00:00.000Z"
  },
  {
    id: "inv-002",
    billId: IDS.billB,
    titleType: "COMPANY",
    invoiceTitle: "华东物流有限公司",
    taxNo: "91310000MA1K3XXXX",
    amount: 128600,
    status: "PENDING",
    createdAt: now
  }
];

export const seedIncidents: Incident[] = [
  {
    id: IDS.incident1,
    orderId: IDS.orderInUse,
    vehicleId: IDS.vehicle2,
    plateNumber: "沪B98765",
    userId: IDS.userC,
    status: "UNDER_REVIEW",
    incidentType: "刮蹭",
    location: "上海市浦东新区张杨路",
    incidentAt: "2026-05-22T16:00:00.000Z",
    reportedAt: "2026-05-22T16:30:00.000Z",
    reporterPhone: "13800138000",
    description: "倒车时剐蹭停车场立柱，已拍照留证",
    hasInjury: false,
    policeReportNo: "",
    insuranceStatus: "REPORTED",
    responsibleParty: "RENTER",
    serviceContext: "SELF_DRIVE",
    vehicleHold: true,
    handlerId: "p1000001-0001-4000-8000-000000000001",
    estimatedCost: 2800,
    pauseBilling: true
  }
];

export const seedTickets: ServiceTicket[] = [
  {
    id: "tk-001",
    ticketNo: "CS202605001",
    userId: IDS.userC,
    orderId: IDS.orderInUse,
    category: "事故咨询",
    subject: "使用中剐蹭如何理赔",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assigneeId: "p1000001-0001-4000-8000-000000000004",
    createdAt: "2026-05-22T17:00:00.000Z"
  },
  {
    id: "tk-002",
    ticketNo: "CS202605002",
    userId: IDS.userB,
    category: "账单疑问",
    subject: "5月账单明细核对",
    status: "OPEN",
    priority: "NORMAL",
    createdAt: "2026-05-27T10:00:00.000Z"
  }
];

export const seedPricingRules: PricingRule[] = [
  {
    id: "prc-001",
    name: "C端自驾日租-默认",
    billingMode: "HYBRID",
    timeUnit: "DAY",
    basePrice: 399,
    includedKm: 200,
    overKmPrice: 2,
    serviceMode: "SELF_DRIVE",
    accountType: "C",
    priority: 100,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
    remark: "日租含 200km，超公里 ¥2/km"
  },
  {
    id: "prc-002",
    name: "C端自驾按小时（短租）",
    billingMode: "TIME",
    timeUnit: "HOUR",
    basePrice: 68,
    includedKm: 0,
    overKmPrice: 0,
    serviceMode: "SELF_DRIVE",
    accountType: "C",
    priority: 90,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
    remark: "最短 4 小时起租"
  },
  {
    id: "prc-003",
    name: "B端包车合同价",
    billingMode: "HYBRID",
    timeUnit: "DAY",
    basePrice: 459,
    includedKm: 300,
    overKmPrice: 1.5,
    serviceMode: "WITH_DRIVER",
    accountType: "B",
    priority: 80,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
    remark: "含司机费，协议价表"
  },
  {
    id: "prc-003b",
    name: "B端部分带司机+自驾",
    billingMode: "HYBRID",
    timeUnit: "DAY",
    basePrice: 429,
    includedKm: 250,
    overKmPrice: 1.6,
    serviceMode: "MIXED",
    accountType: "B",
    priority: 75,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE",
    remark: "含部分司机服务天数，自驾段须驾照"
  },
  {
    id: "prc-004",
    name: "G端政务包车",
    billingMode: "TIME",
    timeUnit: "DAY",
    basePrice: 520,
    includedKm: 250,
    overKmPrice: 1.8,
    serviceMode: "WITH_DRIVER",
    accountType: "G",
    priority: 70,
    effectiveFrom: "2026-01-01",
    status: "ACTIVE"
  },
  {
    id: "prc-005",
    name: "SUV 车型系数价",
    billingMode: "HYBRID",
    timeUnit: "DAY",
    basePrice: 499,
    includedKm: 200,
    overKmPrice: 2.5,
    serviceMode: "SELF_DRIVE",
    vehicleTypeId: "SUV",
    accountType: "ALL",
    priority: 60,
    effectiveFrom: "2026-03-01",
    status: "ACTIVE",
    remark: "车型维度加价"
  },
  {
    id: "prc-006",
    name: "按里程专线",
    billingMode: "MILEAGE",
    timeUnit: "DAY",
    basePrice: 3.2,
    includedKm: 0,
    overKmPrice: 0,
    serviceMode: "SELF_DRIVE",
    accountType: "B",
    priority: 40,
    effectiveFrom: "2026-02-01",
    status: "ACTIVE",
    remark: "basePrice 为每公里单价"
  },
  {
    id: "prc-007",
    name: "长租月租（停用演示）",
    billingMode: "TIME",
    timeUnit: "MONTH",
    basePrice: 8800,
    includedKm: 3000,
    overKmPrice: 1.2,
    serviceMode: "SELF_DRIVE",
    accountType: "ALL",
    priority: 30,
    effectiveFrom: "2025-01-01",
    effectiveTo: "2025-12-31",
    status: "INACTIVE",
    remark: "历史规则，仅供筛选演示"
  }
];

export const seedCosts: OperatingCostEntry[] = [
  {
    id: "cost-001",
    category: "VEHICLE",
    subCategory: "INSURANCE",
    amount: 8500,
    vehicleId: IDS.vehicle1,
    period: "2026-05",
    status: "CONFIRMED",
    createdAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "cost-002",
    category: "THIRD_PARTY",
    subCategory: "VIOLATION_API",
    amount: 0.36,
    period: "2026-05",
    status: "CONFIRMED",
    remark: "数脉违章 6 车次",
    createdAt: "2026-05-15T00:00:00.000Z"
  },
  {
    id: "cost-003",
    category: "LABOR",
    subCategory: "DRIVER_SALARY",
    amount: 12000,
    period: "2026-05",
    status: "CONFIRMED",
    createdAt: "2026-05-01T00:00:00.000Z"
  }
];

export const seedCoupons: Coupon[] = [
  {
    id: "cpn-001",
    code: "NEWUSER100",
    name: "新用户立减100",
    discountType: "FIXED",
    discountValue: 100,
    minOrderAmount: 500,
    status: "ACTIVE",
    validTo: "2026-12-31"
  }
];

export const seedDrivers: Driver[] = [
  {
    id: IDS.driver1,
    driverNo: "D-SH-001",
    name: "张师傅",
    phone: "13900001001",
    licenseNo: "310101199001011234",
    licenseType: "A1",
    city: "上海",
    status: "ON_DUTY",
    rating: 4.9
  },
  {
    id: IDS.driver2,
    driverNo: "D-SH-002",
    name: "李师傅",
    phone: "13900001002",
    licenseNo: "310101198805051234",
    licenseType: "C1",
    city: "上海",
    status: "AVAILABLE",
    rating: 4.7
  }
];

export const seedPersonnel: Personnel[] = [
  {
    id: "p1000001-0001-4000-8000-000000000001",
    employeeNo: "EMP001",
    name: "陈运营",
    phone: "13800001001",
    role: "OPERATOR",
    department: "运营中心",
    storeScope: ["*"],
    status: "ACTIVE"
  },
  {
    id: "p1000001-0001-4000-8000-000000000004",
    employeeNo: "EMP004",
    name: "刘客服",
    phone: "13800001004",
    role: "CUSTOMER_SERVICE",
    department: "客服中心",
    storeScope: ["*"],
    status: "ACTIVE"
  },
  {
    id: "p1000001-0001-4000-8000-000000000002",
    employeeNo: "EMP002",
    name: "周财务",
    phone: "13800001002",
    role: "FINANCE",
    department: "财务部",
    storeScope: ["*"],
    status: "ACTIVE"
  }
];

const coreViolationTasks: ViolationBatchTask[] = [
  {
    id: "vt-001",
    taskNo: "VIO202605001",
    vehicleIds: [IDS.vehicle1, IDS.vehicle2, IDS.vehicle3],
    status: "COMPLETED",
    provider: "SHUMAI",
    unitCost: 0.06,
    totalCost: 0.18,
    quotaMonth: "2026-05",
    createdAt: "2026-05-10T08:00:00.000Z",
    completedAt: "2026-05-10T08:02:00.000Z",
    scope: "FILTERED",
    dateFrom: "2026-04-01",
    dateTo: "2026-05-31",
    recentDaysOnly: false,
    resultSummary: {
      queriedVehicles: 3,
      dateFrom: "2026-04-01",
      dateTo: "2026-05-31",
      recentDaysOnly: false,
      newViolations: 1,
      totalInRange: 2,
      unpaidCount: 1,
      unprocessedCount: 1,
      inProgressCount: 0,
      processedCount: 1
    }
  },
  {
    id: "vt-002",
    taskNo: "VIO202605002",
    vehicleIds: [IDS.vehicle1],
    status: "RUNNING",
    provider: "SHUMAI",
    unitCost: 0.06,
    totalCost: 0.06,
    quotaMonth: "2026-05",
    createdAt: now,
    scope: "FILTERED",
    dateFrom: "2026-05-01",
    dateTo: "2026-06-01",
    recentDaysOnly: true,
    recentDays: 30
  }
];

const coreViolations: ViolationRecord[] = [
  {
    id: "vr-001",
    vehicleId: IDS.vehicle2,
    plateNumber: "沪B98765",
    driverId: IDS.driver2,
    violationTime: "2026-04-20T14:22:00.000Z",
    location: "上海市静安区南京西路",
    fineAmount: 200,
    points: 3,
    status: "UNPAID",
    handleStatus: "UNPROCESSED",
    violationCode: "1345",
    remark: "包车服务期间（李师傅）"
  },
  {
    id: "vr-002",
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    driverId: IDS.driver1,
    violationTime: "2026-05-18T09:15:00.000Z",
    location: "上海市浦东新区张杨路",
    fineAmount: 100,
    points: 2,
    status: "PAID",
    handleStatus: "PROCESSED",
    violationCode: "1625",
    processedAt: "2026-05-20T10:00:00.000Z",
    processedBy: "运营-李调度",
    remark: "包车服务期间（张师傅）"
  },
  {
    id: "vr-003",
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    orderId: IDS.orderCompleted,
    userId: IDS.userC,
    violationTime: "2026-04-22T10:30:00.000Z",
    location: "上海市浦东新区世纪大道",
    fineAmount: 200,
    points: 3,
    status: "UNPAID",
    handleStatus: "UNPROCESSED",
    violationCode: "1357",
    behavior: "违反禁令标志",
    responsibleParty: "RENTER",
    serviceContext: "SELF_DRIVE",
    liabilityStatus: "BILLED",
    serviceFee: 50,
    remark: "自驾租期内 · 待客户结清"
  }
];

const coreMileageRecords: MileageRecord[] = [
  {
    id: "mr-001",
    vehicleId: IDS.vehicle2,
    plateNumber: "沪B98765",
    mileageKm: 15200,
    previousMileageKm: 15000,
    deltaKm: 200,
    source: "ORDER_RETURN",
    orderId: IDS.orderInUse,
    recordedAt: "2026-05-20T18:00:00.000Z",
    recordedBy: "门店-虹桥"
  },
  {
    id: "mr-002",
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    mileageKm: 28800,
    previousMileageKm: 28000,
    deltaKm: 800,
    source: "GPS_SYNC",
    recordedAt: "2026-05-28T06:00:00.000Z"
  },
  {
    id: "mr-003",
    vehicleId: IDS.vehicle3,
    plateNumber: "京C66889",
    mileageKm: 110_200,
    previousMileageKm: 108_500,
    deltaKm: 1700,
    source: "ORDER_RETURN",
    recordedAt: "2026-05-20T12:00:00.000Z",
    recordedBy: "北京门店"
  },
  {
    id: "mr-003b",
    vehicleId: IDS.vehicle3,
    plateNumber: "京C66889",
    mileageKm: 112_500,
    previousMileageKm: 110_200,
    deltaKm: 2300,
    source: "MANUAL",
    recordedAt: "2026-05-29T10:00:00.000Z",
    recordedBy: "陈运营"
  }
];

export const seedViolationTasks: ViolationBatchTask[] = [...coreViolationTasks, ...fleetBundle.violationTasks];
export const seedViolations: ViolationRecord[] = [...coreViolations, ...fleetBundle.violations];
export const seedMileageRecords: MileageRecord[] = [...coreMileageRecords, ...fleetBundle.mileageRecords];

const coreMaintenanceOrders: MaintenanceOrder[] = [
  {
    id: "mo-001",
    workOrderNo: "WO202605001",
    vehicleId: IDS.vehicle3,
    plateNumber: "京C66889",
    orderType: "REPAIR",
    status: "IN_PROGRESS",
    title: "发动机故障灯检修",
    description: "OBD 读码 P0420，更换氧传感器",
    estimatedCost: 2800,
    actualCost: 2650,
    scheduledAt: "2026-05-26T09:00:00.000Z",
    mileageAtService: 42100,
    storeId: IDS.storeBj
  },
  {
    id: "mo-002",
    workOrderNo: "WO202605002",
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    orderType: "ROUTINE",
    status: "SCHEDULED",
    title: "常规保养（机油机滤）",
    description: "按里程 30000km 保养提醒自动生成",
    estimatedCost: 680,
    scheduledAt: "2026-06-05T09:00:00.000Z",
    mileageAtService: 30000,
    storeId: IDS.storeSh
  },
  {
    id: "mo-003",
    workOrderNo: "WO202604003",
    vehicleId: "d4000001-0001-4000-8000-000000000004",
    plateNumber: "沪D11223",
    orderType: "REPAIR",
    status: "COMPLETED",
    title: "事故钣金喷漆",
    estimatedCost: 4500,
    actualCost: 4200,
    scheduledAt: "2026-05-10T08:00:00.000Z",
    completedAt: "2026-05-18T17:00:00.000Z",
    mileageAtService: 55800,
    storeId: IDS.storeSh
  }
];

export const seedMaintenanceOrders: MaintenanceOrder[] = [
  ...coreMaintenanceOrders,
  ...fleetBundle.maintenanceOrders
];

export const seedViolationQuota: ViolationQuota = fleetBundle.violationQuota;

const coreGps: GpsSnapshot[] = [
  {
    vehicleId: IDS.vehicle2,
    plateNumber: "沪B98765",
    lat: 31.2304,
    lng: 121.4737,
    speed: 42,
    online: true,
    provider: "CHENGZAI",
    updatedAt: now
  },
  {
    vehicleId: IDS.vehicle1,
    plateNumber: "沪A12345",
    lat: 31.1943,
    lng: 121.318,
    speed: 0,
    online: true,
    provider: "TUQIANG",
    updatedAt: now
  }
];

export const seedGps: GpsSnapshot[] = [...coreGps, ...fleetBundle.gpsSnapshots];

export const seedMapPolicies: MapPolicy[] = [
  {
    id: "map-001",
    scene: "BOOKING_PICKUP",
    mode: "MAP_DIRECT",
    provider: "amap",
    commercialLicensed: true
  },
  {
    id: "map-002",
    scene: "GPS_TRACK",
    mode: "GPS_PASSTHROUGH",
    provider: "TUQIANG",
    commercialLicensed: false
  }
];

const fleetAvailable = seedVehicles.filter((v) => v.status === "AVAILABLE").length;
const fleetInUse = seedVehicles.filter((v) => v.status === "IN_USE" || v.status === "OCCUPIED").length;

export const seedDashboard: OpsDashboard = {
  revenue: { month: 286500, quarter: 812000, year: 3250000 },
  utilizationRate: Math.round((fleetInUse / seedVehicles.length) * 1000) / 1000,
  activeOrders: 48,
  overdueBills: 2,
  incidentOpen: 3,
  costMonth: 98500,
  grossMargin: 0.656
};

export const seedFleetStats = {
  totalVehicles: seedVehicles.length,
  available: fleetAvailable,
  inUseOrOccupied: fleetInUse,
  maintenance: seedVehicles.filter((v) => v.status === "MAINTENANCE").length,
  accidentHold: seedVehicles.filter((v) => v.status === "ACCIDENT_HOLD").length,
  mileageRecords: seedMileageRecords.length,
  violations: seedViolations.length,
  maintenanceOrders: seedMaintenanceOrders.length,
  gpsOnline: seedGps.filter((g) => g.online).length
};
