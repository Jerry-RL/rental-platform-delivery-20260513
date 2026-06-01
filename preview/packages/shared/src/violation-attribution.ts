import { pickPrimaryMembership } from "./account-segment";
import type { PreviewStore } from "./store";
import type {
  Order,
  UserViolationView,
  ViolationRecord,
  ViolationResponsibleParty,
  ViolationServiceContext
} from "./types";
import {
  filterViolations,
  inferHandleStatus,
  normalizeViolation,
  type ViolationListQuery
} from "./violation-batch";
import {
  liabilityStatusLabel,
  responsiblePartyLabel,
  serviceContextLabel
} from "./labels";

export const DEFAULT_VIOLATION_SERVICE_FEE = 50;

const inRentalPeriod = (order: Order, violationTime: string) =>
  violationTime >= order.pickupTime && violationTime <= order.returnTime;

/** 按车辆 + 违章时间匹配唯一租期订单（演示取最近一单） */
export const findRentalOrderForViolation = (
  store: PreviewStore,
  violation: Pick<ViolationRecord, "vehicleId" | "violationTime">
): Order | undefined => {
  const candidates = store.orders
    .filter((o) => o.vehicleId === violation.vehicleId && inRentalPeriod(o, violation.violationTime))
    .sort((a, b) => b.pickupTime.localeCompare(a.pickupTime));
  return candidates[0];
};

const resolveResponsibleParty = (order: Order): ViolationResponsibleParty => {
  if (order.serviceMode === "WITH_DRIVER") return "PLATFORM_DRIVER";
  if (order.billingAccountId && order.accountType !== "C") return "ENTERPRISE";
  return "RENTER";
};

const resolveServiceContext = (order: Order): ViolationServiceContext => {
  if (order.serviceMode === "WITH_DRIVER") return "WITH_DRIVER";
  if (order.serviceMode === "MIXED") return "MIXED";
  return "SELF_DRIVE";
};

const defaultLiabilityStatus = (
  v: ViolationRecord
): ViolationRecord["liabilityStatus"] => {
  if (v.liabilityStatus) return v.liabilityStatus;
  if (v.handleStatus === "WAIVED" || v.remark?.includes("申诉")) return "WAIVED";
  if (v.status === "PAID" && v.handleStatus === "PROCESSED") return "SETTLED";
  if (v.handleStatus === "IN_PROGRESS") return "BILLED";
  return "CONFIRMED";
};

/** 用户驾车违章：租期匹配 → 责任主体 → 订单/用户/司机回填 */
export const attributeViolationRecord = (
  store: PreviewStore,
  raw: ViolationRecord
): ViolationRecord => {
  const base = {
    ...normalizeViolation(raw),
    handleStatus: inferHandleStatus(normalizeViolation(raw))
  };

  const order = base.orderId
    ? store.orders.find((o) => o.id === base.orderId)
    : findRentalOrderForViolation(store, base);

  if (!order) {
    return {
      ...base,
      serviceContext: base.serviceContext ?? "OUTSIDE_RENTAL",
      responsibleParty: base.responsibleParty ?? "UNKNOWN",
      liabilityStatus: defaultLiabilityStatus(base),
      serviceFee: base.serviceFee ?? 0
    };
  }

  const responsibleParty = base.responsibleParty ?? resolveResponsibleParty(order);
  const serviceContext = base.serviceContext ?? resolveServiceContext(order);

  return {
    ...base,
    orderId: order.id,
    userId: base.userId ?? order.userId,
    driverId:
      responsibleParty === "PLATFORM_DRIVER"
        ? base.driverId ?? order.driverId
        : base.driverId,
    responsibleParty,
    serviceContext,
    liabilityStatus: defaultLiabilityStatus(base),
    serviceFee:
      base.serviceFee ??
      (responsibleParty === "RENTER" || responsibleParty === "ENTERPRISE"
        ? DEFAULT_VIOLATION_SERVICE_FEE
        : 0),
    behavior:
      base.behavior ??
      (base.violationCode ? `交通违法代码 ${base.violationCode}` : "交通违法行为")
  };
};

export const refreshAllViolationAttribution = (store: PreviewStore): void => {
  store.violations = store.violations.map((v) => attributeViolationRecord(store, v));
};

export const buildUserViolationView = (
  store: PreviewStore,
  v: ViolationRecord
): UserViolationView => {
  const attributed = attributeViolationRecord(store, v);
  const order = attributed.orderId
    ? store.orders.find((o) => o.id === attributed.orderId)
    : undefined;
  const serviceFee = attributed.serviceFee ?? 0;
  return {
    ...attributed,
    orderNo: order?.orderNo,
    responsiblePartyLabel:
      responsiblePartyLabel[attributed.responsibleParty ?? "UNKNOWN"] ?? "—",
    liabilityStatusLabel:
      liabilityStatusLabel[attributed.liabilityStatus ?? "PENDING"] ?? "—",
    serviceContextLabel:
      serviceContextLabel[attributed.serviceContext ?? "OUTSIDE_RENTAL"] ?? "—",
    totalDue: attributed.fineAmount + serviceFee
  };
};

const userCanSeeViolation = (
  store: PreviewStore,
  userId: string,
  v: ViolationRecord
): boolean => {
  if (v.userId === userId) return true;
  const membership = pickPrimaryMembership(store, userId);
  if (!membership || v.responsibleParty !== "ENTERPRISE") return false;
  if (!v.orderId) return false;
  const order = store.orders.find((o) => o.id === v.orderId);
  return order?.billingAccountId === membership.org.id;
};

export const listUserViolations = (
  store: PreviewStore,
  userId: string,
  q: ViolationListQuery = {}
): UserViolationView[] => {
  let items = store.violations
    .map((v) => buildUserViolationView(store, v))
    .filter((v) => userCanSeeViolation(store, userId, v));

  if (q.paymentStatus) items = items.filter((v) => v.status === q.paymentStatus);
  if (q.handleStatus) items = items.filter((v) => v.handleStatus === q.handleStatus);
  if (q.plateNumber) items = items.filter((v) => v.plateNumber.includes(q.plateNumber!));

  const to = q.dateTo ? `${q.dateTo}T23:59:59.000Z` : undefined;
  let from = q.dateFrom ? `${q.dateFrom}T00:00:00.000Z` : "";
  if (q.recentDays) {
    const days = Number(q.recentDays) || 30;
    const now = new Date("2026-06-01T12:00:00.000Z").getTime();
    from = new Date(now - days * 86400000).toISOString();
  }
  if (from && to) {
    items = items.filter(
      (v) => v.violationTime >= from && v.violationTime <= `${q.dateTo}T23:59:59.000Z`
    );
  }

  items.sort((a, b) => b.violationTime.localeCompare(a.violationTime));
  return items;
};

export const listOrderViolations = (
  store: PreviewStore,
  orderId: string
): UserViolationView[] =>
  store.violations
    .map((v) => buildUserViolationView(store, v))
    .filter((v) => v.orderId === orderId)
    .sort((a, b) => b.violationTime.localeCompare(a.violationTime));

export const listDriverViolations = (
  store: PreviewStore,
  driverId: string
): UserViolationView[] =>
  store.violations
    .map((v) => buildUserViolationView(store, v))
    .filter(
      (v) =>
        v.driverId === driverId &&
        (v.responsibleParty === "PLATFORM_DRIVER" || v.serviceContext === "WITH_DRIVER")
    )
    .sort((a, b) => b.violationTime.localeCompare(a.violationTime));

export type UserViolationSummary = {
  total: number;
  unpaid: number;
  pendingLiability: number;
  totalDueUnpaid: number;
};

export const buildUserViolationSummary = (
  store: PreviewStore,
  userId: string
): UserViolationSummary => {
  const items = listUserViolations(store, userId);
  const unpaidItems = items.filter((v) => v.status === "UNPAID");
  return {
    total: items.length,
    unpaid: unpaidItems.length,
    pendingLiability: items.filter(
      (v) => v.liabilityStatus === "PENDING" || v.liabilityStatus === "CONFIRMED"
    ).length,
    totalDueUnpaid: unpaidItems.reduce((sum, v) => sum + v.totalDue, 0)
  };
};

export const listAdminViolations = (
  store: PreviewStore,
  q: ViolationListQuery
): UserViolationView[] => {
  let items = filterViolations(store.violations, q).map((v) =>
    buildUserViolationView(store, v)
  );
  if (q.userId) items = items.filter((v) => v.userId === q.userId);
  if (q.orderId) items = items.filter((v) => v.orderId === q.orderId);
  if (q.responsibleParty) {
    items = items.filter((v) => v.responsibleParty === q.responsibleParty);
  }
  return items;
};
