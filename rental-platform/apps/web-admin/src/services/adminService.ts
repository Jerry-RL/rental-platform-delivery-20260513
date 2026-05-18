import { requestJson, requestJsonWithMock } from "../lib/api";
import type { ApiResult } from "../lib/api";
import type {
  Driver,
  EnterpriseAccount,
  GpsSnapshot,
  IndividualUser,
  IntegrationCost,
  MapPolicy,
  Order,
  PaginatedResult,
  Personnel,
  ReminderRule,
  Vehicle,
  ViolationQuota,
  ViolationTask
} from "../features/types";

export const listIndividualUsers = (
  params: { keyword?: string; status?: string; licenseValid?: string; page?: number; pageSize?: number },
  headers: HeadersInit
) => {
  const query = new URLSearchParams({ page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 10) });
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.licenseValid) query.set("licenseValid", params.licenseValid);
  return requestJson<PaginatedResult<IndividualUser>>(`/users?${query.toString()}`, { headers });
};

export const createIndividualUser = (
  payload: { phone: string; password: string; realName: string; licenseValid?: boolean },
  headers: HeadersInit
) => requestJson<IndividualUser>("/users", { method: "POST", headers, body: payload });

export const updateIndividualUserStatus = (userId: string, status: IndividualUser["status"], headers: HeadersInit) =>
  requestJson<IndividualUser>(`/users/${userId}/status`, { method: "PUT", headers, body: { status } });

export const listEnterpriseUsers = (
  params: { keyword?: string; status?: string; accountType?: string; page?: number; pageSize?: number },
  headers: HeadersInit
) => {
  const query = new URLSearchParams({ page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 10) });
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.accountType) query.set("accountType", params.accountType);
  return requestJson<PaginatedResult<EnterpriseAccount>>(`/users/enterprise?${query.toString()}`, { headers });
};

export const createEnterpriseUser = (
  payload: {
    orgName: string;
    accountType: EnterpriseAccount["accountType"];
    contactName: string;
    contactPhone: string;
    creditLimit?: number;
  },
  headers: HeadersInit
) => requestJson<EnterpriseAccount>("/users/enterprise", { method: "POST", headers, body: payload });

export const updateEnterpriseUserStatus = (accountId: string, status: EnterpriseAccount["status"], headers: HeadersInit) =>
  requestJson<EnterpriseAccount>(`/users/enterprise/${accountId}/status`, { method: "PUT", headers, body: { status } });

export const loginAdmin = (phone: string, password: string) =>
  requestJson<{ accessToken: string }>("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { phone, password }
  });

export const listVehicles = (
  params: {
    city?: string;
    vehicleTypeId?: string;
    status?: string;
    keyword?: string;
    reminder?: string;
    page?: number;
    pageSize?: number;
  },
  headers: HeadersInit
) => {
  const query = new URLSearchParams({ scope: "all", page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 10) });
  if (params.city) query.set("city", params.city);
  if (params.vehicleTypeId) query.set("vehicleTypeId", params.vehicleTypeId);
  if (params.status) query.set("status", params.status);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.reminder) query.set("reminder", params.reminder);
  return requestJson<PaginatedResult<Vehicle>>(`/vehicles?${query.toString()}`, { headers });
};

export const getVehicleById = (vehicleId: string, headers: HeadersInit) =>
  requestJson<Vehicle>(`/vehicles/${vehicleId}`, { headers });

export const createVehicle = (payload: Record<string, unknown>, headers: HeadersInit) =>
  requestJson<Vehicle>("/vehicles", { method: "POST", headers, body: payload });

export const updateVehicle = (vehicleId: string, payload: Record<string, unknown>, headers: HeadersInit) =>
  requestJson<Vehicle>(`/vehicles/${vehicleId}`, { method: "PUT", headers, body: payload });

export const updateVehicleStatus = (vehicleId: string, status: Vehicle["status"], headers: HeadersInit) =>
  requestJson<Vehicle>(`/vehicles/${vehicleId}/status`, { method: "PUT", headers, body: { status } });

export const deleteVehicle = (vehicleId: string, headers: HeadersInit) =>
  requestJson<{ id: string; deleted: boolean }>(`/vehicles/${vehicleId}`, { method: "DELETE", headers });

export const listDrivers = (
  params: {
    city?: string;
    status?: string;
    keyword?: string;
    reminder?: string;
    page?: number;
    pageSize?: number;
  },
  headers: HeadersInit
) => {
  const query = new URLSearchParams({ scope: "all", page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 10) });
  if (params.city) query.set("city", params.city);
  if (params.status) query.set("status", params.status);
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.reminder) query.set("reminder", params.reminder);
  return requestJson<PaginatedResult<Driver>>(`/drivers?${query.toString()}`, { headers });
};

export const createDriver = (payload: Record<string, unknown>, headers: HeadersInit) =>
  requestJson<Driver>("/drivers", { method: "POST", headers, body: payload });

export const updateDriver = (driverId: string, payload: Record<string, unknown>, headers: HeadersInit) =>
  requestJson<Driver>(`/drivers/${driverId}`, { method: "PUT", headers, body: payload });

export const updateDriverStatus = (driverId: string, status: Driver["status"], headers: HeadersInit) =>
  requestJson<Driver>(`/drivers/${driverId}/status`, { method: "PUT", headers, body: { status } });

export const listPersonnel = (
  params: { role?: string; status?: string; department?: string; keyword?: string; page?: number; pageSize?: number },
  headers: HeadersInit
) => {
  const query = new URLSearchParams({ page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 10) });
  if (params.role) query.set("role", params.role);
  if (params.status) query.set("status", params.status);
  if (params.department) query.set("department", params.department);
  if (params.keyword) query.set("keyword", params.keyword);
  return requestJson<PaginatedResult<Personnel>>(`/personnel?${query.toString()}`, { headers });
};

export const createPersonnel = (
  payload: {
    name: string;
    phone: string;
    email?: string;
    role: Personnel["role"];
    department: string;
    status?: Personnel["status"];
  },
  headers: HeadersInit
) => requestJson<Personnel>("/personnel", { method: "POST", headers, body: payload });

export const updatePersonnelStatus = (personnelId: string, status: Personnel["status"], headers: HeadersInit) =>
  requestJson<Personnel>(`/personnel/${personnelId}/status`, { method: "PUT", headers, body: { status } });

export const listOrders = (
  params: { status?: string; orderNo?: string; userId?: string; page?: number; pageSize?: number },
  headers: HeadersInit
) => {
  const query = new URLSearchParams({ scope: "all", page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 10) });
  if (params.status) query.set("status", params.status);
  if (params.orderNo) query.set("orderNo", params.orderNo);
  if (params.userId) query.set("userId", params.userId);
  return requestJson<PaginatedResult<Order>>(`/orders?${query.toString()}`, { headers });
};

export const getOrderById = (orderId: string, headers: HeadersInit) => requestJson<Order>(`/orders/${orderId}`, { headers });

export const sendPaymentCallback = (
  payload: {
    orderId?: string;
    billId?: string;
    channelTxnNo: string;
    status: "SUCCESS" | "FAILED";
    paidAmount?: number;
    paidAt: string;
    idempotencyKey?: string;
    signature: string;
  }
) => {
  const endpoint = payload.billId ? "/payments/bills/callback" : "/payments/callback";
  return requestJson<unknown>(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload
  });
};

export const pickupOrder = (orderId: string, headers: HeadersInit) =>
  requestJson<unknown>(`/orders/${orderId}/pickup`, { method: "PUT", headers });

export const returnOrder = (orderId: string, headers: HeadersInit) =>
  requestJson<unknown>(`/orders/${orderId}/return`, { method: "PUT", headers });

export const createInvoice = (orderId: string, headers: HeadersInit) =>
  requestJson<{ id: string }>("/invoices", {
    method: "POST",
    headers,
    body: {
      orderId,
      titleType: "PERSONAL",
      invoiceTitle: "租车用户",
      email: "demo@rental.com"
    }
  });

export const createViolationTask = (vehicleIds: string[], headers: HeadersInit): Promise<ApiResult<ViolationTask>> => {
  const mockTask: ViolationTask = {
    id: `vt_${Date.now()}`,
    status: "SUCCESS",
    totalVehicles: vehicleIds.length,
    successVehicles: vehicleIds.length,
    failedVehicles: 0,
    totalCost: Number((vehicleIds.length * 0.05).toFixed(2)),
    createdAt: new Date().toISOString()
  };
  return requestJsonWithMock<ViolationTask>("/admin/violation-tasks", {
    method: "POST",
    headers,
    body: { vehicleIds },
    mockData: mockTask
  });
};

export const getViolationQuota = (month: string, headers: HeadersInit, current: ViolationQuota) =>
  requestJsonWithMock<ViolationQuota>(`/admin/violation-query-quota?month=${encodeURIComponent(month)}`, {
    headers,
    mockData: current
  });

export const saveViolationQuota = (quota: ViolationQuota, headers: HeadersInit) =>
  requestJsonWithMock<ViolationQuota>("/admin/violation-query-quota", {
    method: "PUT",
    headers,
    body: quota,
    mockData: quota
  });

export const getIntegrationCosts = (month: string, headers: HeadersInit) => {
  const mockData: IntegrationCost[] = [
    { id: "cost_1", date: `${month}-06`, type: "VIOLATION", quantity: 30, unitCost: 0.05, totalCost: 1.5 },
    { id: "cost_2", date: `${month}-08`, type: "GPS", quantity: 1200, unitCost: 0.01, totalCost: 12 }
  ];
  return requestJsonWithMock<IntegrationCost[]>(`/admin/integration-costs/summary?month=${encodeURIComponent(month)}`, {
    headers,
    mockData
  });
};

export const saveReminderRule = (rule: ReminderRule, headers: HeadersInit) =>
  requestJsonWithMock<ReminderRule>("/admin/reminder-rules", {
    method: "PUT",
    headers,
    body: rule,
    mockData: rule
  });

export const getReminderLogs = (headers: HeadersInit) => {
  const mockLogs = [
    { id: "log_1", vehicleId: "vehicle-sh-001", type: "INSURANCE", sendAt: new Date().toISOString(), status: "SENT" },
    { id: "log_2", vehicleId: "vehicle-sh-002", type: "ANNUAL_REVIEW", sendAt: new Date().toISOString(), status: "SENT" }
  ];
  return requestJsonWithMock<unknown[]>("/admin/reminder-logs", { headers, mockData: mockLogs });
};

export const saveMapPolicy = (policy: MapPolicy, headers: HeadersInit) =>
  requestJsonWithMock<MapPolicy>("/admin/map-policy", {
    method: "PUT",
    headers,
    body: policy,
    mockData: policy
  });

export const getGpsSnapshot = (vehicleId: string, headers: HeadersInit) => {
  const mockSnapshot: GpsSnapshot = {
    vehicleId,
    lng: 121.4737,
    lat: 31.2304,
    speed: 42,
    provider: "gps-vendor-a",
    onlineStatus: "ONLINE",
    locatedAt: new Date().toISOString()
  };
  return requestJsonWithMock<GpsSnapshot>(`/gps/vehicles/${encodeURIComponent(vehicleId)}/realtime`, {
    headers,
    mockData: mockSnapshot
  });
};
