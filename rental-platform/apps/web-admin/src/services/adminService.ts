import { requestJson, requestJsonWithMock } from "../lib/api";
import type { ApiResult } from "../lib/api";
import type { GpsSnapshot, IntegrationCost, MapPolicy, ReminderRule, ViolationQuota, ViolationTask } from "../features/types";

export const loginAdmin = (phone: string, password: string) =>
  requestJson<{ accessToken: string }>("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { phone, password }
  });

export const getOrderById = (orderId: string, headers: HeadersInit) =>
  requestJson<unknown>(`/orders/${orderId}`, { headers });

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
