const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "待支付",
  PAYMENT_FAILED: "支付失败",
  CONFIRMED: "已确认",
  READY_FOR_PICKUP: "待提车",
  IN_USE: "使用中",
  RETURN_PENDING_SETTLEMENT: "待结算",
  SETTLED: "已结算",
  COMPLETED: "已完成",
  CANCELED: "已取消"
};

const VEHICLE_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "可租",
  IN_USE: "使用中",
  MAINTENANCE: "维保中"
};

export const orderStatusLabel = (status: string) => ORDER_STATUS_LABELS[status] ?? status;
export const vehicleStatusLabel = (status: string) => VEHICLE_STATUS_LABELS[status] ?? status;

const DRIVER_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "空闲",
  ON_DUTY: "出车中",
  OFF_DUTY: "休息",
  SUSPENDED: "停用"
};

const PERSONNEL_ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理员",
  OPERATOR: "运营",
  FINANCE: "财务",
  CUSTOMER_SERVICE: "客服"
};

const PERSONNEL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "在职",
  INACTIVE: "离职"
};

export const driverStatusLabel = (status: string) => DRIVER_STATUS_LABELS[status] ?? status;
export const personnelRoleLabel = (role: string) => PERSONNEL_ROLE_LABELS[role] ?? role;
export const personnelStatusLabel = (status: string) => PERSONNEL_STATUS_LABELS[status] ?? status;

export const ORDER_STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS);
export const VEHICLE_STATUS_OPTIONS = Object.keys(VEHICLE_STATUS_LABELS);
export const DRIVER_STATUS_OPTIONS = Object.keys(DRIVER_STATUS_LABELS);
export const PERSONNEL_ROLE_OPTIONS = Object.keys(PERSONNEL_ROLE_LABELS);
export const PERSONNEL_STATUS_OPTIONS = Object.keys(PERSONNEL_STATUS_LABELS);

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  B: "企业客户 (B)",
  G: "政府/事业单位 (G)"
};

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "正常",
  SUSPENDED: "已停用"
};

export const accountTypeLabel = (type: string) => ACCOUNT_TYPE_LABELS[type] ?? type;
export const userStatusLabel = (status: string) => USER_STATUS_LABELS[status] ?? status;

export const ACCOUNT_TYPE_OPTIONS = Object.keys(ACCOUNT_TYPE_LABELS);
export const USER_STATUS_OPTIONS = Object.keys(USER_STATUS_LABELS);

const REMINDER_LABELS: Record<string, string> = {
  OK: "正常",
  EXPIRING_SOON: "即将到期",
  EXPIRED: "已过期",
  UNKNOWN: "未设置"
};

export const reminderLabel = (level: string) => REMINDER_LABELS[level] ?? level;
