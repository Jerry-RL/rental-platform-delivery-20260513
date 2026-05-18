const { request } = require("../utils/request");

function normalizeLoginResponse(payload) {
  if (!payload) return payload;
  const accessToken = payload.accessToken || payload.token || payload.jwtToken || "";
  return Object.assign({}, payload, { accessToken });
}

function normalizeOrder(payload) {
  if (!payload) return payload;
  const id = payload.id || payload.orderId || payload.orderNo || "";
  return Object.assign({}, payload, { id });
}

function normalizePaymentPayload(payload) {
  if (!payload) return payload;
  const paymentId = payload.paymentId || payload.id || payload.payId || "";
  const prepayId = payload.prepayId || "";
  const packageValue = payload.package || payload.packageValue || (prepayId ? "prepay_id=" + prepayId : "");
  const timeStamp = payload.timeStamp || payload.timestamp || String(Math.floor(Date.now() / 1000));
  const nonceStr = payload.nonceStr || payload.noncestr || "mocknonce";
  const signType = payload.signType || "RSA";
  const paySign = payload.paySign || payload.signature || "";
  return Object.assign({}, payload, {
    paymentId,
    package: packageValue,
    timeStamp,
    nonceStr,
    signType,
    paySign
  });
}

function normalizePaymentStatus(payload, paymentId) {
  if (!payload) return { paymentId, status: "UNKNOWN" };
  const status = payload.status || payload.tradeState || payload.payStatus || "UNKNOWN";
  return Object.assign({}, payload, { paymentId: payload.paymentId || paymentId, status });
}

function login(phone, password) {
  return request({
    path: "/users/login",
    method: "POST",
    data: { phone, password },
    mockData: {
      accessToken: "mock-mp-token"
    }
  }).then((result) => {
    if (!result.ok || !result.data) return result;
    return Object.assign({}, result, { data: normalizeLoginResponse(result.data) });
  });
}

function unwrapPageItems(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.items && Array.isArray(payload.items)) return payload.items;
  return [];
}

function searchVehicles(city, vehicleTypeId) {
  return request({
    path: `/vehicles?city=${encodeURIComponent(city)}&vehicleTypeId=${encodeURIComponent(vehicleTypeId)}&scope=rental&page=1&pageSize=50`,
    method: "GET",
    mockData: {
      items: [
        { id: "v1", plateNumber: "沪A12345", vehicleTypeId: "SUV", city, dailyPrice: 320, status: "AVAILABLE" },
        { id: "v2", plateNumber: "沪B77889", vehicleTypeId: "SUV", city, dailyPrice: 360, status: "AVAILABLE" }
      ],
      total: 2,
      page: 1,
      pageSize: 50
    }
  }).then((result) => {
    if (!result.ok) return result;
    return Object.assign({}, result, { data: unwrapPageItems(result.data) });
  });
}

function listAvailableDrivers(city) {
  return request({
    path: `/drivers?scope=rental&city=${encodeURIComponent(city)}&page=1&pageSize=50`,
    method: "GET",
    mockData: {
      items: [
        { id: "driver-sh-001", driverNo: "D-SH-001", name: "张师傅", city, rating: 4.9, status: "AVAILABLE" },
        { id: "driver-bj-001", driverNo: "D-BJ-001", name: "王师傅", city: "Beijing", rating: 4.8, status: "AVAILABLE" }
      ],
      total: 2,
      page: 1,
      pageSize: 50
    }
  }).then((result) => {
    if (!result.ok) return result;
    return Object.assign({}, result, { data: unwrapPageItems(result.data) });
  });
}

function listMyOrders(params) {
  const page = (params && params.page) || 1;
  const pageSize = (params && params.pageSize) || 10;
  const status = (params && params.status) || "";
  const query = `scope=mine&page=${page}&pageSize=${pageSize}` + (status ? `&status=${encodeURIComponent(status)}` : "");
  return request({
    path: `/orders?${query}`,
    method: "GET",
    mockData: {
      items: [
        {
          id: "order_mock_001",
          orderNo: "R20260518-0001",
          plateNumber: "沪A12345",
          city: "Shanghai",
          status: "CONFIRMED",
          estimatedFee: 320,
          totalFee: 320,
          pickupTime: new Date().toISOString()
        }
      ],
      total: 1,
      page: 1,
      pageSize: 10
    }
  });
}

function createOrder(payload) {
  return request({
    path: "/orders",
    method: "POST",
    data: payload,
    mockData: {
      id: "order_mock_001",
      orderNo: "R20260518-0001",
      status: "CONFIRMED",
      settlementMode: payload.settlementMode,
      serviceMode: payload.serviceMode
    }
  }).then((result) => {
    if (!result.ok || !result.data) return result;
    return Object.assign({}, result, { data: normalizeOrder(result.data) });
  });
}

function createViolationTask(vehicleIds) {
  const now = Date.now();
  return request({
    path: "/admin/violation-tasks",
    method: "POST",
    data: { vehicleIds },
    mockData: {
      id: "vt_" + now,
      status: "SUCCESS",
      totalVehicles: vehicleIds.length,
      successVehicles: vehicleIds.length,
      failedVehicles: 0,
      totalCost: Number((vehicleIds.length * 0.05).toFixed(2)),
      createdAt: new Date().toISOString()
    }
  });
}

function getGpsRealtime(vehicleId) {
  return request({
    path: `/gps/vehicles/${encodeURIComponent(vehicleId)}/realtime`,
    method: "GET",
    mockData: {
      vehicleId,
      lng: 121.4737,
      lat: 31.2304,
      speed: 42,
      onlineStatus: "ONLINE",
      locatedAt: new Date().toISOString()
    }
  });
}

function getGpsTrack(vehicleId) {
  const now = Date.now();
  return request({
    path: `/gps/vehicles/${encodeURIComponent(vehicleId)}/tracks?hours=24`,
    method: "GET",
    mockData: [
      { lng: 121.4621, lat: 31.2285, speed: 28, at: new Date(now - 3600000).toISOString() },
      { lng: 121.4688, lat: 31.231, speed: 32, at: new Date(now - 1800000).toISOString() },
      { lng: 121.4733, lat: 31.2345, speed: 25, at: new Date(now).toISOString() }
    ]
  });
}

function getReminderSummary() {
  return request({
    path: "/users/me/reminder-summary",
    method: "GET",
    mockData: {
      totalVehicles: 12,
      insuranceExpiringIn30Days: 3,
      annualReviewExpiringIn30Days: 2
    }
  });
}

function createPayment(orderId) {
  return request({
    path: "/payments/wechat/prepay",
    method: "POST",
    data: { orderId },
    mockData: {
      paymentId: "pay_mock_" + Date.now(),
      timeStamp: String(Math.floor(Date.now() / 1000)),
      nonceStr: "mocknonce",
      package: "prepay_id=mock_prepay_id_001",
      signType: "RSA",
      paySign: "mock-signature",
      amount: 320
    }
  }).then((result) => {
    if (!result.ok || !result.data) return result;
    return Object.assign({}, result, { data: normalizePaymentPayload(result.data) });
  });
}

function queryPaymentStatus(paymentId) {
  return request({
    path: `/payments/${encodeURIComponent(paymentId)}`,
    method: "GET",
    mockData: {
      paymentId,
      status: "PAID",
      paidAt: new Date().toISOString()
    }
  }).then((result) => {
    if (!result.ok || !result.data) return result;
    return Object.assign({}, result, { data: normalizePaymentStatus(result.data, paymentId) });
  });
}

function cancelOrder(orderId, reason) {
  const cancelPayload = {
    reason: reason || "USER_CANCEL_PAYMENT",
    source: "MINI_PROGRAM"
  };
  return request({
    path: `/orders/${encodeURIComponent(orderId)}/cancel`,
    method: "PUT",
    data: cancelPayload,
    mockData: {
      id: orderId,
      status: "CANCELLED",
      cancelReason: cancelPayload.reason,
      cancelledAt: new Date().toISOString()
    }
  }).then((result) => {
    if (!result.ok || !result.data) return result;
    return Object.assign({}, result, { data: normalizeOrder(result.data) });
  });
}

function getOrderById(orderId) {
  return request({
    path: `/orders/${encodeURIComponent(orderId)}`,
    method: "GET",
    mockData: {
      id: orderId,
      orderNo: "R20260518-0001",
      status: "PENDING_PAYMENT",
      city: "Shanghai",
      settlementMode: "POSTPAID",
      serviceMode: "SELF_DRIVE",
      createdAt: new Date().toISOString()
    }
  }).then((result) => {
    if (!result.ok || !result.data) return result;
    return Object.assign({}, result, { data: normalizeOrder(result.data) });
  });
}

module.exports = {
  login,
  searchVehicles,
  listAvailableDrivers,
  listMyOrders,
  createOrder,
  createViolationTask,
  getGpsRealtime,
  getGpsTrack,
  getReminderSummary,
  createPayment,
  queryPaymentStatus,
  cancelOrder,
  getOrderById
};
