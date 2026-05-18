import { requestJson, requestJsonWithMock } from "../lib/api";
import type { Bill, BillPayment, GpsRealtime, Order, ReminderSummary, Vehicle, ViolationTaskSummary } from "../features/types";

export const registerUser = (phone: string, password: string) =>
  requestJson<unknown>("/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      phone,
      password,
      realName: "租车用户",
      verifyCode: "1234",
      licenseValid: true
    }
  });

export const loginUser = (phone: string, password: string) =>
  requestJson<{ accessToken: string }>("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { phone, password }
  });

export const searchVehicles = (city: string, vehicleTypeId: string) =>
  requestJson<Vehicle[]>(`/vehicles?city=${encodeURIComponent(city)}&vehicleTypeId=${encodeURIComponent(vehicleTypeId)}`);

export const createOrder = (
  payload: {
    vehicleTypeId: string;
    pickupStoreId: string;
    returnStoreId: string;
    pickupTime: string;
    returnTime: string;
    city: string;
    settlementMode: "PREPAID" | "POSTPAID";
    serviceMode: "SELF_DRIVE" | "WITH_DRIVER";
    accountType: "C" | "B" | "G";
    billingAccountId?: string;
    driverId?: string;
  },
  headers: HeadersInit
) => requestJson<Order>("/orders", { method: "POST", headers, body: payload });

export const createBill = (
  payload: { billingAccountId: string; accountType: "B" | "G"; billingPeriod: string },
  headers: HeadersInit
) => requestJson<Bill>("/bills", { method: "POST", headers, body: payload });

export const confirmBill = (billId: string, headers: HeadersInit) =>
  requestJson<Bill>(`/bills/${billId}/confirm`, {
    method: "PUT",
    headers,
    body: { confirmedBy: "bg-finance-admin-001", confirmRemark: "已核对账单明细" }
  });

export const createBillPayment = (
  payload: {
    billId: string;
    amount: number;
    channel: "bank";
    billingAccountId: string;
    billingPeriod: string;
    settlementMode: "POSTPAID";
  },
  headers: HeadersInit
) => requestJson<BillPayment>("/payments/bills", { method: "POST", headers, body: payload });

export const sendBillPaymentCallback = (
  payload: {
    billId: string;
    channelTxnNo: string;
    status: "SUCCESS" | "FAILED";
    paidAmount: number;
    paidAt: string;
    idempotencyKey: string;
    signature: string;
  }
) =>
  requestJson<unknown>("/payments/bills/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload
  });

export const getBillById = (billId: string, headers: HeadersInit) => requestJson<Bill>(`/bills/${billId}`, { headers });

export const getReminderSummary = (headers: HeadersInit) => {
  const mockSummary: ReminderSummary = {
    totalVehicles: 12,
    insuranceExpiringIn30Days: 3,
    annualReviewExpiringIn30Days: 2
  };
  return requestJsonWithMock<ReminderSummary>("/users/me/reminder-summary", { headers, mockData: mockSummary });
};

export const getGpsRealtime = (vehicleId: string, headers: HeadersInit) => {
  const mockRealtime: GpsRealtime = {
    vehicleId,
    lng: 121.4672,
    lat: 31.2341,
    speed: 36,
    onlineStatus: "ONLINE",
    locatedAt: new Date().toISOString()
  };
  return requestJsonWithMock<GpsRealtime>(`/gps/vehicles/${encodeURIComponent(vehicleId)}/realtime`, {
    headers,
    mockData: mockRealtime
  });
};

export const getGpsTrack = (vehicleId: string, headers: HeadersInit) => {
  const now = Date.now();
  const mockTrack = [
    { lng: 121.4621, lat: 31.2285, speed: 28, at: new Date(now - 60 * 60 * 1000).toISOString() },
    { lng: 121.4688, lat: 31.231, speed: 32, at: new Date(now - 30 * 60 * 1000).toISOString() },
    { lng: 121.4733, lat: 31.2345, speed: 25, at: new Date(now).toISOString() }
  ];
  return requestJsonWithMock<unknown[]>(`/gps/vehicles/${encodeURIComponent(vehicleId)}/tracks?hours=24`, {
    headers,
    mockData: mockTrack
  });
};

export const getLatestViolationTask = (headers: HeadersInit) => {
  const mockTask: ViolationTaskSummary = {
    id: `vt_${Date.now()}`,
    status: "SUCCESS",
    totalVehicles: 8,
    totalCost: 0.4,
    createdAt: new Date().toISOString()
  };
  return requestJsonWithMock<ViolationTaskSummary>("/users/me/violation-tasks/latest", { headers, mockData: mockTask });
};
