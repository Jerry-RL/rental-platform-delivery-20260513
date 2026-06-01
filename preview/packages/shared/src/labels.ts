import type {
  ApprovalStatus,
  BillStatus,
  IncidentStatus,
  OrderStatus,
  OrgAccountStatus,
  PaymentStatus,
  RefundStatus,
  TicketStatus,
  VehicleStatus
} from "./types";

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "待支付",
  PAYMENT_FAILED: "支付失败",
  CONFIRMED: "已确认",
  READY_FOR_PICKUP: "待提车",
  IN_USE: "使用中",
  RETURN_PENDING_SETTLEMENT: "待结算",
  SETTLED: "已结算",
  COMPLETED: "已完成",
  CANCELED: "已取消",
  INVOICE_PENDING: "开票中",
  INVOICE_ISSUED: "已开发票",
  REFUND_PENDING: "退款处理中",
  REFUND_PARTIAL: "部分退款",
  REFUND_SUCCESS: "退款成功"
};

export const invoiceStatusLabel: Record<import("./types").InvoiceStatus, string> = {
  PENDING: "待开具",
  ISSUED: "已开具",
  FAILED: "开具失败"
};

export const billStatusLabel: Record<BillStatus, string> = {
  PENDING_CONFIRM: "待确认",
  PENDING_PAYMENT: "待付款",
  PARTIALLY_PAID: "部分付款",
  PAID: "已结清",
  PAYMENT_FAILED: "付款失败",
  OVERDUE: "已逾期"
};

export const vehicleStatusLabel: Record<VehicleStatus, string> = {
  AVAILABLE: "可用",
  OCCUPIED: "已占用",
  IN_USE: "已租出",
  MAINTENANCE: "维修中",
  ACCIDENT_HOLD: "事故停运",
  RETIRED: "报废"
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "处理中",
  SUCCESS: "成功",
  FAILED: "失败"
};

export const refundStatusLabel: Record<RefundStatus, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  COMPLETED: "已退款"
};

export const incidentStatusLabel: Record<IncidentStatus, string> = {
  REPORTED: "已上报",
  UNDER_REVIEW: "审核中",
  INSURANCE_PROCESSING: "理赔中",
  RESOLVED: "已解决",
  CLOSED: "已关闭"
};

export const orgMemberStatusLabel: Record<import("./types").OrgMemberStatus, string> = {
  PENDING: "待开通",
  ACTIVE: "已启用",
  DISABLED: "已禁用"
};

export const orgDataScopeLabel: Record<import("./types").OrgMember["dataScope"], string> = {
  ORG: "全组织",
  DEPT: "本部门",
  SELF: "仅本人"
};

export const orgRoleCodeLabel: Record<string, string> = {
  ORG_ADMIN: "企业管理员",
  BILL_CONFIRM: "账单确认",
  ORDER_CREATE: "下单权限",
  MEMBER: "普通成员",
  FINANCE: "财务",
  DEPT_ADMIN: "部门管理员"
};

export const approvalTypeLabel: Record<import("./types").ApprovalType, string> = {
  MEMBER_OPEN: "成员开通",
  ROLE_CHANGE: "角色变更",
  BILL_CONFIRM: "账单确认"
};

export const orgAccountTypeLabel: Record<import("./types").OrgAccountType, string> = {
  B: "企业客户",
  G: "政务客户"
};

export const orgStatusLabel: Record<OrgAccountStatus, string> = {
  PENDING: "待激活",
  ACTIVE: "启用中",
  FROZEN: "冻结中",
  CLOSED: "已注销"
};

export const ticketStatusLabel: Record<TicketStatus, string> = {
  OPEN: "待受理",
  ASSIGNED: "已分派",
  IN_PROGRESS: "处理中",
  RESOLVED: "已解决",
  CLOSED: "已关闭"
};

export const approvalStatusLabel: Record<ApprovalStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已通过",
  REJECTED: "已驳回"
};

export const settlementModeLabel = { PREPAID: "即时支付", POSTPAID: "先用后付" } as const;
export const serviceModeLabel = {
  SELF_DRIVE: "自驾",
  WITH_DRIVER: "包车带司机",
  MIXED: "部分带司机+自驾"
} as const;

export const billingModeLabel = {
  TIME: "按时间",
  MILEAGE: "按里程",
  HYBRID: "时间+里程"
} as const;

export const timeUnitLabel = {
  HOUR: "按小时",
  DAY: "按天",
  WEEK: "按周",
  MONTH: "按月"
} as const;

export const pricingRuleStatusLabel = {
  ACTIVE: "生效中",
  INACTIVE: "已停用"
} as const;

export const accountTypeLabel = {
  C: "C端个人",
  B: "B端企业",
  G: "G端政务",
  ALL: "全部客户"
} as const;

export const feeTypeLabel: Record<string, string> = {
  RENTAL: "租金",
  DRIVER: "司机费",
  OVER_KM: "超公里费",
  CROSS_STORE: "异店还车",
  DEPOSIT: "押金",
  LATE_RETURN: "超时还车",
  DAMAGE: "车损",
  FUEL: "油费补差",
  CLEANING: "清洁费",
  OTHER: "其他"
};

export const paymentChannelLabel: Record<string, string> = {
  wechat: "微信支付",
  alipay: "支付宝",
  bank: "对公转账"
};

export const formatMoney = (n: number) =>
  `¥${n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const maintenanceOrderTypeLabel = { ROUTINE: "保养", REPAIR: "维修" } as const;

export const maintenanceOrderStatusLabel = {
  SCHEDULED: "已排期",
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
} as const;

export const licenseVerifyStatusLabel: Record<
  import("./types").LicenseVerifyStatus,
  string
> = {
  NONE: "未认证",
  PENDING: "审核中",
  APPROVED: "已通过",
  REJECTED: "已驳回"
};

export const licenseStatusLabel: Record<import("./types").LicenseStatus, string> = {
  NONE: "无效",
  VALID: "有效",
  EXPIRED: "已过期"
};

export const violationTaskStatusLabel: Record<
  import("./types").ViolationTaskStatus,
  string
> = {
  PENDING: "待执行",
  RUNNING: "查询中",
  COMPLETED: "已完成",
  FAILED: "失败"
};

export const violationHandleStatusLabel: Record<
  import("./types").ViolationHandleStatus,
  string
> = {
  UNPROCESSED: "未处理",
  IN_PROGRESS: "处理中",
  PROCESSED: "已处理",
  WAIVED: "已豁免"
};

export const violationPaymentStatusLabel: Record<
  import("./types").ViolationPaymentStatus,
  string
> = {
  UNPAID: "未缴款",
  PAID: "已缴款"
};

export const violationBatchScopeLabel: Record<
  import("./types").ViolationBatchScope,
  string
> = {
  ALL_FLEET: "全车队",
  FILTERED: "条件筛选"
};

export const vehicleHistoryEventTypeLabel: Record<
  import("./types").VehicleHistoryEventType,
  string
> = {
  PURCHASE: "购买入库",
  MAINTENANCE: "保养",
  INSURANCE: "保险",
  REPAIR: "维修",
  ORDER: "租赁订单",
  ANNUAL_REVIEW: "年检"
};

export const mileageSourceLabel = {
  ORDER_RETURN: "还车验收",
  MANUAL: "人工录入",
  GPS_SYNC: "GPS 同步"
} as const;
