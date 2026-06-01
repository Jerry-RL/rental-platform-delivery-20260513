import {
  accountAuthErrorCode,
  buildRentalEligibility,
  resolveAccountContext
} from "./account-segment";
import { canUserLogin, validateRegisterRequest } from "./user-auth";
import { checkEligibility, eligibilityErrorCode } from "./eligibility";
import {
  checkMultiSelfDriveEligibility,
  findAccountHolderLicense,
  findSelfDriveDriverLicense,
  gateSelfDriveForVehicle,
  isAccountHolderLicense,
  isSelfDriveDriverLicense,
  listUserLicenses,
  parseSelfDriveVehicleIds
} from "./multi-license";
import { buildMaintenanceReminder } from "./maintenance";
import { normalizeVehicleImages } from "./vehicle-images";
import { applyLicenseToUser } from "./license-sync";
import { findUserLicense, previewStore } from "./store";
import type {
  ApiResponse,
  ConfirmBillRequest,
  CreateInvoiceRequest,
  CreateOrderRequest,
  CreatePaymentRequest,
  EligibilitySnapshot,
  LoginRequest,
  PageResult,
  RegisterRequest,
  SubmitLicenseRequest,
  SubmitRealnameRequest,
  UserLicenseRecord
} from "./types";
import { tryHandleAdminCrud } from "./admin-crud-handlers";
import { buildOrderDetail } from "./order-detail";
import { applyOrderPickup } from "./order-fulfillment";
import { reconcileAllOrderStatuses, reconcileOrderStatusInStore } from "./order-status";
import { pickVehicleForBooking } from "./vehicle-catalog";
import {
  buildViolationSummary,
  createViolationBatchTask,
  detectViolationHandleUpdates,
  filterViolations
} from "./violation-batch";
import type { CreateViolationBatchRequest } from "./types";
import { VEHICLE_IMAGE_MAX_BYTES } from "./upload";
import {
  buildOrgAccountDetail,
  createOrgMember,
  filterOrgMembers,
  filterOrgs,
  type CreateOrgMemberRequest
} from "./org-admin";
import { buildDriverAdminProfile } from "./driver-admin-profile";
import { buildDriverDetail } from "./driver-detail";
import { buildVehicleHistory } from "./vehicle-history";
import { calcQuote, type QuoteRequest } from "./pricing";
import { IDS } from "./seed";

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

const rid = () => `req-${Date.now().toString(36)}`;
const ts = () => new Date().toISOString();

const ok = <T>(data: T, message = "OK"): ApiResponse<T> => ({
  code: 0,
  message,
  data,
  timestamp: ts(),
  requestId: rid()
});

const fail = <T>(code: number, message: string, data: T | null = null): ApiResponse<T | null> => ({
  code,
  message,
  data,
  timestamp: ts(),
  requestId: rid()
});

const page = <T>(items: T[], pageNum = 1, pageSize = 20): PageResult<T> => ({
  items: items.slice((pageNum - 1) * pageSize, pageNum * pageSize),
  pageNum,
  pageSize,
  total: items.length
});

const parseQuery = (url: string) => {
  const q = url.includes("?") ? url.split("?")[1] : "";
  return Object.fromEntries(new URLSearchParams(q));
};

type MockRequest = {
  method: string;
  path: string;
  body?: unknown;
  userId?: string;
};

const syncUserFromLicense = (userId: string) => {
  const idx = previewStore.users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  const mine = listUserLicenses(previewStore.userLicenses, userId);
  const license =
    mine.find((l) => l.verifyStatus === "APPROVED" && isAccountHolderLicense(l)) ??
    mine.find((l) => isAccountHolderLicense(l));
  previewStore.users[idx] = applyLicenseToUser(previewStore.users[idx], license);
};

const gateBgAccount = (
  userId: string | undefined
): ApiResponse<EligibilitySnapshot | null> | null => {
  const uid = userId ?? IDS.userC;
  const account = resolveAccountContext(previewStore, uid);
  if (!account?.requiresOrgAuth || account.accountAuthOk) return null;
  const snapshot = buildRentalEligibility(previewStore, uid, "WITH_DRIVER");
  return fail(accountAuthErrorCode(account), account.message, snapshot) as ApiResponse<
    EligibilitySnapshot | null
  >;
};

const gateSelfDrive = (
  userId: string | undefined,
  serviceMode?: "SELF_DRIVE" | "WITH_DRIVER" | "MIXED",
  vehicleId?: string,
  driverLicenseOnly = false
): ApiResponse<EligibilitySnapshot | null> | null => {
  const bg = gateBgAccount(userId);
  if (bg) return bg;
  if (serviceMode !== "SELF_DRIVE" && serviceMode !== "MIXED") return null;
  const uid = userId ?? IDS.userC;
  const user = previewStore.users.find((u) => u.id === uid);
  if (!user) return fail(1004, "用户不存在");
  const snapshot = gateSelfDriveForVehicle({
    user,
    licenses: previewStore.userLicenses,
    vehicleId,
    driverLicenseOnly,
    serviceMode: serviceMode === "MIXED" ? "MIXED" : "SELF_DRIVE"
  });
  if (snapshot.eligible) return null;
  const code = eligibilityErrorCode(snapshot) ?? 3005;
  return fail(code, snapshot.message, snapshot);
};

export const handleMockRequest = async <T>(req: MockRequest): Promise<ApiResponse<T>> => {
  await delay();
  const { method, path, body, userId: ctxUserId } = req;
  const pathname = path.split("?")[0];
  const q = parseQuery(path);
  const s = previewStore;

  if (method === "POST" && pathname === "/api/v1/users/login") {
    const { phone } = body as LoginRequest;
    const user = s.users.find((u) => u.phone === phone.trim());
    if (!user) {
      return fail(1001, "该手机号未注册，请先注册") as ApiResponse<T>;
    }
    const loginCheck = canUserLogin(s, user);
    if (!loginCheck.ok) {
      return fail(loginCheck.code, loginCheck.message) as ApiResponse<T>;
    }
    const account = resolveAccountContext(s, user.id)!;
    return ok({
      accessToken: `preview-token-${user.id}`,
      refreshToken: `refresh-${user.id}`,
      expiresIn: 7200,
      user: { id: user.id, phone: user.phone, realName: user.realName },
      account
    } as T);
  }

  if (method === "GET" && pathname === "/api/v1/users/me") {
    const uid = ctxUserId ?? IDS.userC;
    const user = s.users.find((u) => u.id === uid);
    if (!user) return fail(1004, "用户不存在") as ApiResponse<T>;
    const account = resolveAccountContext(s, uid)!;
    return ok({ user, account } as T);
  }

  if (method === "POST" && pathname === "/api/v1/users/register") {
    const req = body as RegisterRequest;
    const valid = validateRegisterRequest(req.phone, req.verifyCode);
    if (!valid.ok) return fail(1001, valid.message) as ApiResponse<T>;
    const phone = req.phone.trim();
    if (s.users.some((u) => u.phone === phone)) {
      return fail(1002, "该手机号已注册，请直接登录") as ApiResponse<T>;
    }
    const id = `user-${Date.now()}`;
    const user = {
      id,
      phone,
      realName: "新用户",
      status: "ACTIVE" as const,
      realNameStatus: "NONE" as const,
      licenseStatus: "NONE" as const,
      licenseVerifyStatus: "NONE" as const,
      registeredAt: ts(),
      registrationSource: "SELF" as const
    };
    s.users.unshift(user);
    return ok(user as T, "注册成功，请登录");
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/users\/[^/]+\/licenses$/)) {
    const userId = pathname.split("/")[4];
    const items = listUserLicenses(s.userLicenses, userId);
    return ok(items as T);
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/users\/[^/]+\/license$/)) {
    const userId = pathname.split("/")[4];
    const vehicleId = q.vehicleId;
    const license = vehicleId
      ? findSelfDriveDriverLicense(s.userLicenses, userId, vehicleId)
      : findAccountHolderLicense(s.userLicenses, userId) ??
        findUserLicense(s.userLicenses, userId);
    return ok((license ?? null) as T);
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/users\/[^/]+\/license$/)) {
    const userId = pathname.split("/")[4];
    const user = s.users.find((u) => u.id === userId);
    if (!user) return fail(1004, "用户不存在") as ApiResponse<T>;
    if (user.realNameStatus !== "APPROVED") {
      return fail(3004, "请先完成实名认证") as ApiResponse<T>;
    }
    const req = body as SubmitLicenseRequest;
    const isDriver = Boolean(req.vehicleId) || req.role === "SELF_DRIVE_DRIVER";
    if (isDriver && !req.driverName?.trim()) {
      return fail(1001, "请填写本次自驾司机姓名") as ApiResponse<T>;
    }
    const existingIdx = isDriver
      ? s.userLicenses.findIndex(
          (l) => l.userId === userId && l.vehicleId === req.vehicleId && isSelfDriveDriverLicense(l)
        )
      : s.userLicenses.findIndex((l) => l.userId === userId && isAccountHolderLicense(l));
    const record: UserLicenseRecord = {
      id: existingIdx >= 0 ? s.userLicenses[existingIdx].id : `lic-${Date.now()}`,
      userId,
      licenseNo: req.licenseNo,
      licenseClass: req.licenseClass,
      issueDate: req.issueDate,
      expiryDate: req.expiryDate,
      licenseImageUrl: req.licenseImageUrl ?? "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600",
      licenseImageBackUrl: req.licenseImageBackUrl,
      role: isDriver ? "SELF_DRIVE_DRIVER" : "ACCOUNT_HOLDER",
      driverName: isDriver ? req.driverName?.trim() : undefined,
      vehicleId: isDriver ? req.vehicleId : undefined,
      plateNumber: isDriver ? req.plateNumber : undefined,
      verifyStatus: "PENDING",
      submittedAt: ts(),
      reviewedAt: undefined,
      rejectReason: undefined
    };
    if (existingIdx >= 0) s.userLicenses[existingIdx] = record;
    else s.userLicenses.push(record);
    syncUserFromLicense(userId);
    const hint = isDriver
      ? `（${req.plateNumber ?? ""} · 司机 ${req.driverName}）`
      : "（账户本人）";
    return ok(
      record as T,
      isDriver ? `本次自驾司机驾照已提交${hint}，等待审核` : `本人驾照已提交${hint}，等待审核`
    );
  }

  if (method === "POST" && pathname.match(/^\/api\/v1\/users\/[^/]+\/realname$/)) {
    const userId = pathname.split("/")[4];
    const userIdx = s.users.findIndex((u) => u.id === userId);
    if (userIdx < 0) return fail(1004, "用户不存在") as ApiResponse<T>;
    const req = body as SubmitRealnameRequest;
    s.users[userIdx] = {
      ...s.users[userIdx],
      realName: req.realName,
      realNameStatus: "PENDING"
    };
    return ok(s.users[userIdx] as T, "实名认证已提交");
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/users\/[^/]+\/eligibility$/)) {
    const userId = pathname.split("/")[4];
    const user = s.users.find((u) => u.id === userId);
    if (!user) return fail(1004, "用户不存在") as ApiResponse<T>;
    const serviceMode =
      (q.serviceMode as "SELF_DRIVE" | "WITH_DRIVER" | "MIXED") || "SELF_DRIVE";
    const account = resolveAccountContext(s, userId);
    if (!account) return fail(1004, "用户不存在") as ApiResponse<T>;
    if (account.requiresOrgAuth && !account.accountAuthOk) {
      const snapshot = buildRentalEligibility(s, userId, serviceMode);
      return fail(accountAuthErrorCode(account), account.message, snapshot) as ApiResponse<T>;
    }
    const selfDriveIds = parseSelfDriveVehicleIds(q.selfDriveVehicleIds);
    if (
      (serviceMode === "SELF_DRIVE" || serviceMode === "MIXED") &&
      selfDriveIds.length > 1
    ) {
      const vehicles = selfDriveIds.map((vehicleId) => {
        const v = s.vehicles.find((x) => x.id === vehicleId);
        return { vehicleId, plateNumber: v?.plateNumber };
      });
      const snapshot = checkMultiSelfDriveEligibility(
        user,
        s.userLicenses,
        vehicles
      );
      return ok(snapshot as T);
    }
    const snapshot = buildRentalEligibility(s, userId, serviceMode);
    return ok(snapshot as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/licenses") {
    let items = s.userLicenses.map((lic) => {
      const user = s.users.find((u) => u.id === lic.userId);
      return { ...lic, userPhone: user?.phone, userRealName: user?.realName };
    });
    if (q.verifyStatus) items = items.filter((l) => l.verifyStatus === q.verifyStatus);
    if (q.phone) items = items.filter((l) => l.userPhone?.includes(q.phone));
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "PUT" && pathname.match(/^\/api\/v1\/admin\/licenses\/[^/]+\/approve$/)) {
    const id = pathname.split("/")[4];
    const lic = s.userLicenses.find((l) => l.id === id);
    if (!lic) return fail(1004, "驾照记录不存在") as ApiResponse<T>;
    lic.verifyStatus = "APPROVED";
    lic.reviewedAt = ts();
    lic.rejectReason = undefined;
    syncUserFromLicense(lic.userId);
    return ok(lic as T, "驾照审核通过");
  }

  if (method === "PUT" && pathname.match(/^\/api\/v1\/admin\/licenses\/[^/]+\/reject$/)) {
    const id = pathname.split("/")[4];
    const lic = s.userLicenses.find((l) => l.id === id);
    if (!lic) return fail(1004, "驾照记录不存在") as ApiResponse<T>;
    const { rejectReason } = body as { rejectReason: string };
    lic.verifyStatus = "REJECTED";
    lic.rejectReason = rejectReason || "证件不清晰或与实名信息不一致";
    lic.reviewedAt = ts();
    syncUserFromLicense(lic.userId);
    return ok(lic as T, "驾照已驳回");
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/(?:admin\/)?vehicles\/[^/]+\/history$/)) {
    const parts = pathname.split("/");
    const id = parts[parts.indexOf("vehicles") + 1];
    const timeline = buildVehicleHistory(s, id);
    if (!timeline) return fail(1004, "车辆不存在") as ApiResponse<T>;
    return ok(timeline as T);
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/vehicles\/[^/]+$/) && !pathname.endsWith("/history")) {
    const id = pathname.split("/").pop()!;
    const vehicle = s.vehicles.find((v) => v.id === id);
    if (!vehicle) return ok(null as T, "车辆不存在");
    return ok(normalizeVehicleImages(vehicle) as T);
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/drivers\/[^/]+$/)) {
    const id = pathname.split("/").pop()!;
    const profile = buildDriverAdminProfile(s, id);
    if (!profile) return fail(1004, "司机不存在") as ApiResponse<T>;
    return ok({
      ...profile.detail,
      recentOrderCount: profile.stats.totalOrders,
      violationCount: profile.stats.violationTotal
    } as T);
  }

  if (method === "GET" && pathname === "/api/v1/drivers") {
    let items = [...s.drivers];
    if (q.city) items = items.filter((d) => d.city === q.city);
    if (q.status) items = items.filter((d) => d.status === q.status);
    else items = items.filter((d) => d.status === "AVAILABLE" || d.status === "ON_DUTY");
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname.startsWith("/api/v1/vehicles")) {
    let items = [...s.vehicles];
    if (q.city) items = items.filter((v) => v.city === q.city);
    if (q.status) items = items.filter((v) => v.status === q.status);
    if (q.vehicleTypeId) items = items.filter((v) => v.vehicleTypeId === q.vehicleTypeId);
    if (q.plateNumber) items = items.filter((v) => v.plateNumber.includes(q.plateNumber));
    if (q.storeId) items = items.filter((v) => v.storeId === q.storeId);
    if (q.maintenanceLevel) {
      items = items.filter((v) => buildMaintenanceReminder(v).level === q.maintenanceLevel);
    }
    return ok(
      page(
        items.map(normalizeVehicleImages),
        Number(q.pageNum) || 1,
        Number(q.pageSize) || 50
      ) as T
    );
  }

  if (method === "GET" && pathname === "/api/v1/admin/maintenance-reminders") {
    let reminders = s.vehicles.map(buildMaintenanceReminder);
    if (q.level) reminders = reminders.filter((r) => r.level === q.level);
    if (q.plateNumber) reminders = reminders.filter((r) => r.plateNumber.includes(q.plateNumber));
    return ok(page(reminders, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/mileage-records") {
    let items = [...s.mileageRecords];
    if (q.vehicleId) items = items.filter((r) => r.vehicleId === q.vehicleId);
    if (q.plateNumber) items = items.filter((r) => r.plateNumber.includes(q.plateNumber));
    if (q.source) items = items.filter((r) => r.source === q.source);
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/maintenance-orders") {
    let items = [...s.maintenanceOrders];
    if (q.orderType) items = items.filter((o) => o.orderType === q.orderType);
    if (q.status) items = items.filter((o) => o.status === q.status);
    if (q.plateNumber) items = items.filter((o) => o.plateNumber.includes(q.plateNumber));
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "POST" && pathname === "/api/v1/admin/uploads/vehicle-image") {
    const req = body as {
      dataUrl?: string;
      fileName?: string;
      mimeType?: string;
      size?: number;
    };
    if (!req.dataUrl?.startsWith("data:image/")) {
      return fail(400, "请上传有效的车辆图片") as ApiResponse<T>;
    }
    const approxBytes = Math.ceil((req.dataUrl.length * 3) / 4);
    if (approxBytes > VEHICLE_IMAGE_MAX_BYTES) {
      return fail(400, `图片过大，请压缩至 ${VEHICLE_IMAGE_MAX_BYTES / 1024}KB 以内`) as ApiResponse<T>;
    }
    return ok(
      {
        url: req.dataUrl,
        fileName: req.fileName ?? "vehicle.jpg",
        mimeType: req.mimeType ?? "image/jpeg",
        size: req.size ?? approxBytes
      } as T,
      "车辆图片上传成功"
    );
  }

  if (method === "GET" && pathname === "/api/v1/admin/violation-quota") {
    return ok(s.violationQuota as T);
  }

  if (method === "POST" && pathname === "/api/v1/admin/violation-tasks") {
    const req = body as CreateViolationBatchRequest;
    const result = createViolationBatchTask(s, req, ts);
    if (result.error) return fail(400, result.message) as ApiResponse<T>;
    return ok(result.task as T, result.message);
  }

  if (method === "POST" && pathname === "/api/v1/admin/violations/detect-handle-status") {
    const updated = detectViolationHandleUpdates(s);
    return ok({ updated } as T, `已检测并同步 ${updated} 条违章处理状态`);
  }

  if (method === "GET" && pathname === "/api/v1/admin/violations/summary") {
    return ok(buildViolationSummary(s.violations, q) as T);
  }

  if (method === "GET" && pathname === "/api/v1/orders") {
    reconcileAllOrderStatuses(s);
    let items = [...s.orders];
    if (q.status) items = items.filter((o) => o.status === q.status);
    if (q.userId) items = items.filter((o) => o.userId === q.userId);
    if (q.orderNo) items = items.filter((o) => o.orderNo.includes(q.orderNo));
    if (q.settlementMode) items = items.filter((o) => o.settlementMode === q.settlementMode);
    if (q.accountType) items = items.filter((o) => o.accountType === q.accountType);
    if (q.plateNumber) items = items.filter((o) => o.plateNumber.includes(q.plateNumber));
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/orders\/[^/]+$/) && !pathname.endsWith("/status")) {
    const id = pathname.split("/").pop()!;
    reconcileOrderStatusInStore(s, id);
    const detail = buildOrderDetail(s, id);
    if (!detail) return ok(null as T, "订单不存在");
    return ok(detail as T);
  }

  if (method === "POST" && pathname === "/api/v1/orders/quote") {
    const req = body as QuoteRequest;
    const vehicle =
      pickVehicleForBooking(s.vehicles, {
        vehicleId: req.vehicleId,
        vehicleTypeId: req.vehicleTypeId,
        brand: req.brand,
        model: req.model,
        city: req.city
      }) ??
      s.vehicles.find((v) => v.status === "AVAILABLE") ??
      s.vehicles[0];
    const bgBlocked = gateBgAccount(ctxUserId);
    if (bgBlocked) return bgBlocked as ApiResponse<T>;
    const blocked = gateSelfDrive(ctxUserId, req.serviceMode, vehicle.id, false);
    if (blocked) return blocked as ApiResponse<T>;
    const rule =
      s.pricingRules.find((r) => r.serviceMode === req.serviceMode && r.status === "ACTIVE") ??
      s.pricingRules[0];
    return ok(calcQuote(vehicle, rule, req, s.stores) as T);
  }

  if (method === "POST" && pathname === "/api/v1/orders") {
    const req = body as CreateOrderRequest;
    const v =
      pickVehicleForBooking(s.vehicles, {
        vehicleId: req.vehicleId,
        vehicleTypeId: req.vehicleTypeId,
        brand: req.brand,
        model: req.model
      }) ??
      s.vehicles.find((x) => x.status === "AVAILABLE") ??
      s.vehicles[0];
    const bgBlocked = gateBgAccount(ctxUserId);
    if (bgBlocked) return bgBlocked as ApiResponse<T>;
    const blocked = gateSelfDrive(ctxUserId, req.serviceMode, v.id, false);
    if (blocked) return blocked as ApiResponse<T>;
    const rule =
      s.pricingRules.find((r) => r.serviceMode === req.serviceMode && r.status === "ACTIVE") ??
      s.pricingRules[0];
    const account = resolveAccountContext(s, ctxUserId ?? IDS.userC);
    const quote = calcQuote(
      v,
      rule,
      {
        vehicleId: v.id,
        vehicleQty: req.vehicleQty,
        pickupStoreId: req.pickupStoreId,
        returnStoreId: req.returnStoreId,
        pickupTime: req.pickupTime,
        returnTime: req.returnTime,
        serviceMode: req.serviceMode,
        billingMode: req.billingMode,
        timeUnit: req.timeUnit,
        estimatedKm: req.estimatedKm,
        couponCode: req.couponCode
      },
      s.stores
    );
    const order = {
      id: `order-${Date.now()}`,
      orderNo: `ORD${Date.now()}`,
      userId: ctxUserId ?? IDS.userC,
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      vehicleTypeId: v.vehicleTypeId,
      pickupStoreId: req.pickupStoreId,
      returnStoreId: req.returnStoreId,
      pickupTime: req.pickupTime,
      returnTime: req.returnTime,
      status: req.settlementMode === "POSTPAID" ? "CONFIRMED" : "PENDING_PAYMENT",
      settlementMode: req.settlementMode,
      serviceMode: req.serviceMode,
      accountType:
        account?.segment && account.segment !== "C"
          ? account.segment
          : req.settlementMode === "POSTPAID"
            ? "B"
            : "C",
      billingAccountId: req.billingAccountId,
      driverId: req.driverId,
      chauffeurFee: quote.chauffeurFee,
      estimatedFee: quote.totalFee,
      totalFee: quote.totalFee,
      paidAmount: 0,
      pricingRuleSnapshotId: quote.pricingRuleId,
      feeDetails: quote.lines.map((line, i) => ({
        id: `fd-new-${i}`,
        orderId: "",
        feeType: line.feeType,
        amount: line.amount,
        remark: line.remark
      }))
    } as (typeof s.orders)[0];
    order.feeDetails?.forEach((f) => {
      f.orderId = order.id;
    });
    s.orders.unshift(order);
    const qty = req.vehicleQty ?? 1;
    if (v.status === "AVAILABLE") v.status = qty > 1 ? "OCCUPIED" : "OCCUPIED";
    return ok(order as T, "订单创建成功");
  }

  if (method === "GET" && pathname === "/api/v1/payments") {
    return ok(page(s.payments, Number(q.pageNum) || 1) as T);
  }

  if (method === "POST" && pathname === "/api/v1/payments") {
    const req = body as CreatePaymentRequest;
    const order = s.orders.find((o) => o.id === req.orderId);
    const payment = {
      id: `pay-${Date.now()}`,
      orderId: req.orderId,
      channel: req.channel,
      channelTxnNo: `${req.channel.toUpperCase()}${Date.now()}`,
      amount: req.amount,
      status: "SUCCESS",
      settlementMode: req.settlementMode,
      billingAccountId: req.billingAccountId,
      billingPeriod: req.billingPeriod,
      createdAt: ts()
    } as (typeof s.payments)[0];
    s.payments.unshift(payment);
    if (order) {
      order.paidAmount += req.amount;
      if (order.paidAmount >= order.totalFee || req.settlementMode === "PREPAID") {
        order.status = "CONFIRMED";
      }
    }
    return ok(payment as T);
  }

  if (method === "POST" && pathname === "/api/v1/refunds") {
    const b = body as { orderId: string; amount: number; reason: string };
    const refund = {
      id: `ref-${Date.now()}`,
      orderId: b.orderId,
      amount: b.amount,
      reason: b.reason,
      status: "PENDING",
      createdAt: ts()
    } as (typeof s.refunds)[0];
    s.refunds.unshift(refund);
    reconcileOrderStatusInStore(s, b.orderId);
    return ok(refund as T);
  }

  if (method === "GET" && pathname === "/api/v1/bills") {
    let items = [...s.bills];
    if (q.billingAccountId) items = items.filter((b) => b.billingAccountId === q.billingAccountId);
    return ok(page(items, Number(q.pageNum) || 1) as T);
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/bills\/[^/]+$/) && !pathname.endsWith("/confirm")) {
    const id = pathname.split("/").pop()!;
    return ok(s.bills.find((b) => b.id === id) as T);
  }

  if (method === "PUT" && pathname.match(/^\/api\/v1\/bills\/[^/]+\/confirm$/)) {
    const id = pathname.split("/")[4];
    const bill = s.bills.find((b) => b.id === id);
    const req = body as ConfirmBillRequest;
    if (bill) {
      bill.status = "PENDING_PAYMENT";
      bill.confirmedAt = ts();
      bill.confirmedBy = req.confirmedBy;
    }
    return ok(bill as T, "账单已确认");
  }

  if (method === "GET" && pathname === "/api/v1/invoices") {
    return ok(page(s.invoices, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "POST" && pathname === "/api/v1/invoices") {
    const req = body as CreateInvoiceRequest;
    const order = req.orderId ? s.orders.find((o) => o.id === req.orderId) : undefined;
    const amount =
      order?.paidAmount && order.paidAmount > 0
        ? order.paidAmount
        : order?.totalFee ?? 0;
    const inv = {
      id: `inv-${Date.now()}`,
      orderId: req.orderId,
      billId: req.billId,
      titleType: req.titleType,
      invoiceTitle: req.invoiceTitle,
      taxNo: req.taxNo,
      email: req.email,
      amount,
      status: "ISSUED",
      invoiceNo: `INV${Date.now()}`,
      createdAt: ts()
    } as (typeof s.invoices)[0];
    s.invoices.unshift(inv);
    if (req.orderId) reconcileOrderStatusInStore(s, req.orderId);
    return ok(inv as T, "电子发票已开具");
  }

  if (method === "GET" && pathname === "/api/v1/orgs") {
    const items = filterOrgs(s.orgs, q);
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/orgs\/[^/]+$/) && !pathname.endsWith("/detail")) {
    const id = pathname.split("/").pop()!;
    const org = s.orgs.find((o) => o.id === id);
    if (!org) return fail(1004, "企业不存在") as ApiResponse<T>;
    return ok(org as T);
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/admin\/orgs\/[^/]+\/detail$/)) {
    const id = pathname.split("/").slice(-2)[0]!;
    const detail = buildOrgAccountDetail(s, id);
    if (!detail) return fail(1004, "企业不存在") as ApiResponse<T>;
    return ok(detail as T);
  }

  if (method === "POST" && pathname === "/api/v1/admin/org-members") {
    try {
      const { member, createdUser } = createOrgMember(s, body as CreateOrgMemberRequest, ts);
      return ok(
        { ...member, createdUser } as T,
        createdUser ? "已创建用户并加入企业" : "已加入企业"
      );
    } catch (e) {
      return fail(400, e instanceof Error ? e.message : "创建失败") as ApiResponse<T>;
    }
  }

  if (method === "GET" && pathname === "/api/v1/admin/dashboard") {
    const available = s.vehicles.filter((v) => v.status === "AVAILABLE").length;
    return ok({
      ...s.dashboard,
      fleetTotal: s.vehicles.length,
      fleetAvailable: available,
      mileageRecordCount: s.mileageRecords.length,
      violationCount: s.violations.length,
      maintenanceOrderCount: s.maintenanceOrders.length,
      gpsOnlineCount: s.gps.filter((g) => g.online).length
    } as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/users") {
    let items = [...s.users];
    if (q.phone) items = items.filter((u) => u.phone.includes(q.phone));
    if (q.realNameStatus) items = items.filter((u) => u.realNameStatus === q.realNameStatus);
    if (q.licenseStatus) items = items.filter((u) => u.licenseStatus === q.licenseStatus);
    if (q.licenseVerifyStatus) items = items.filter((u) => u.licenseVerifyStatus === q.licenseVerifyStatus);
    if (q.status) items = items.filter((u) => u.status === q.status);
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/incidents") {
    return ok(page(s.incidents, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/tickets") {
    return ok(page(s.tickets, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/pricing-rules") {
    let items = [...s.pricingRules];
    if (q.billingMode) items = items.filter((r) => r.billingMode === q.billingMode);
    if (q.serviceMode) items = items.filter((r) => r.serviceMode === q.serviceMode);
    if (q.status) items = items.filter((r) => r.status === q.status);
    if (q.accountType) items = items.filter((r) => r.accountType === q.accountType || r.accountType === "ALL");
    if (q.vehicleTypeId) items = items.filter((r) => !r.vehicleTypeId || r.vehicleTypeId === q.vehicleTypeId);
    if (q.name) items = items.filter((r) => r.name.includes(q.name));
    items.sort((a, b) => b.priority - a.priority);
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/operating-costs") {
    return ok(page(s.costs, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/coupons") {
    return ok(page(s.coupons, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname.match(/^\/api\/v1\/admin\/drivers\/[^/]+\/profile$/)) {
    const parts = pathname.split("/");
    const id = parts[parts.length - 2]!;
    const profile = buildDriverAdminProfile(s, id);
    if (!profile) return fail(1004, "司机不存在") as ApiResponse<T>;
    return ok(profile as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/drivers") {
    return ok(page(s.drivers, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/personnel") {
    return ok(page(s.personnel, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/violation-tasks") {
    return ok(page(s.violationTasks, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/violations") {
    const items = filterViolations(s.violations, q);
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/gps") {
    return ok(s.gps as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/map-policies") {
    return ok(page(s.mapPolicies, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/bank-transactions") {
    return ok(page(s.bankTxns, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/stores") {
    return ok(s.stores as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/refunds") {
    return ok(page(s.refunds, Number(q.pageNum) || 1, Number(q.pageSize) || 20) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/org-members") {
    const items = filterOrgMembers(s, q);
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "GET" && pathname === "/api/v1/admin/approvals") {
    let items = [...s.approvals];
    if (q.orgId) items = items.filter((a) => a.orgId === q.orgId);
    if (q.status) items = items.filter((a) => a.status === q.status);
    if (q.approvalType) items = items.filter((a) => a.approvalType === q.approvalType);
    return ok(page(items, Number(q.pageNum) || 1, Number(q.pageSize) || 50) as T);
  }

  if (method === "PUT" && pathname.match(/^\/api\/v1\/orders\/[^/]+\/pickup$/)) {
    const id = pathname.split("/")[4];
    const order = s.orders.find((o) => o.id === id);
    if (!order) return fail(1004, "订单不存在") as ApiResponse<T>;
    if (ctxUserId && order.userId !== ctxUserId) {
      return fail(1003, "无权操作该订单") as ApiResponse<T>;
    }
    const result = applyOrderPickup(s, id);
    if (!result.ok) return fail(result.code, result.message) as ApiResponse<T>;
    return ok(result.order as T, result.message);
  }

  if (method === "PATCH" && pathname.match(/^\/api\/v1\/orders\/[^/]+\/status$/)) {
    const id = pathname.split("/")[4];
    const order = s.orders.find((o) => o.id === id);
    const { status } = body as { status: string };
    if (order) order.status = status as (typeof order)["status"];
    return ok(order as T);
  }

  const crud = tryHandleAdminCrud(method, pathname, body, s, ok, fail);
  if (crud) return crud as ApiResponse<T>;

  return ok({ message: "preview mock: route not fully implemented", path, method } as T);
};
