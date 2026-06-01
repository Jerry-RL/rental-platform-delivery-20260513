import { pickPrimaryMembership } from "./account-segment";
import {
  incidentStatusLabel,
  insuranceClaimStatusLabel,
  responsiblePartyLabel,
  serviceContextLabel
} from "./labels";
import type { PreviewStore } from "./store";
import type {
  CreateIncidentReportRequest,
  Incident,
  IncidentDetail,
  IncidentStatus,
  Order,
  ServiceTicket,
  UserIncidentSummary,
  UserIncidentView,
  ViolationResponsibleParty,
  ViolationServiceContext
} from "./types";

const REPORTABLE_ORDER_STATUSES: Order["status"][] = ["IN_USE"];

export type IncidentReportGateResult = {
  allowed: boolean;
  code?: "ORDER_NOT_IN_USE" | "NOT_ORDER_OWNER" | "ORDER_NOT_FOUND";
  message: string;
};

const resolveIncidentContext = (order: Order): {
  serviceContext: ViolationServiceContext;
  responsibleParty: ViolationResponsibleParty;
} => {
  if (order.serviceMode === "WITH_DRIVER") {
    return { serviceContext: "WITH_DRIVER", responsibleParty: "PLATFORM_DRIVER" };
  }
  if (order.serviceMode === "MIXED") {
    return { serviceContext: "MIXED", responsibleParty: "RENTER" };
  }
  if (order.billingAccountId && order.accountType !== "C") {
    return { serviceContext: "SELF_DRIVE", responsibleParty: "ENTERPRISE" };
  }
  return { serviceContext: "SELF_DRIVE", responsibleParty: "RENTER" };
};

export const canReportIncident = (
  store: PreviewStore,
  userId: string,
  orderId: string
): IncidentReportGateResult => {
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) {
    return { allowed: false, code: "ORDER_NOT_FOUND", message: "订单不存在" };
  }
  if (!REPORTABLE_ORDER_STATUSES.includes(order.status)) {
    return {
      allowed: false,
      code: "ORDER_NOT_IN_USE",
      message: "仅「使用中」订单可上报租期事故（FR-ORD-008）"
    };
  }
  if (order.userId !== userId) {
    return {
      allowed: false,
      code: "NOT_ORDER_OWNER",
      message: "仅订单用车人可上报事故"
    };
  }
  return { allowed: true, message: "可上报" };
};

export const enrichIncident = (store: PreviewStore, incident: Incident): UserIncidentView => {
  const order = store.orders.find((o) => o.id === incident.orderId);
  const vehicle = store.vehicles.find((v) => v.id === incident.vehicleId);
  const ctx = order ? resolveIncidentContext(order) : null;
  return {
    ...incident,
    plateNumber: incident.plateNumber ?? vehicle?.plateNumber ?? order?.plateNumber,
    userId: incident.userId ?? order?.userId,
    responsibleParty: incident.responsibleParty ?? ctx?.responsibleParty ?? "UNKNOWN",
    serviceContext: incident.serviceContext ?? ctx?.serviceContext ?? "OUTSIDE_RENTAL",
    orderNo: order?.orderNo,
    statusLabel: incidentStatusLabel[incident.status],
    serviceContextLabel:
      serviceContextLabel[incident.serviceContext ?? ctx?.serviceContext ?? "OUTSIDE_RENTAL"],
    responsiblePartyLabel:
      responsiblePartyLabel[incident.responsibleParty ?? ctx?.responsibleParty ?? "UNKNOWN"],
    insuranceStatusLabel: incident.insuranceStatus
      ? insuranceClaimStatusLabel[incident.insuranceStatus]
      : undefined
  };
};

const userCanSeeIncident = (store: PreviewStore, userId: string, incident: Incident): boolean => {
  if (incident.userId === userId) return true;
  const order = store.orders.find((o) => o.id === incident.orderId);
  if (order?.userId === userId) return true;
  const membership = pickPrimaryMembership(store, userId);
  if (!membership || !order) return false;
  return order.billingAccountId === membership.org.id;
};

export const listUserIncidents = (store: PreviewStore, userId: string): UserIncidentView[] =>
  store.incidents
    .filter((i) => userCanSeeIncident(store, userId, i))
    .map((i) => enrichIncident(store, i))
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));

export const listOrderIncidents = (store: PreviewStore, orderId: string): UserIncidentView[] =>
  store.incidents
    .filter((i) => i.orderId === orderId)
    .map((i) => enrichIncident(store, i))
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));

export const buildUserIncidentSummary = (
  store: PreviewStore,
  userId: string
): UserIncidentSummary => {
  const items = listUserIncidents(store, userId);
  const openStatuses: IncidentStatus[] = ["REPORTED", "UNDER_REVIEW", "INSURANCE_PROCESSING"];
  return {
    total: items.length,
    open: items.filter((i) => openStatuses.includes(i.status)).length,
    pauseBillingCount: items.filter((i) => i.pauseBilling).length
  };
};

export const createIncidentReport = (
  store: PreviewStore,
  userId: string,
  req: CreateIncidentReportRequest,
  ts: () => string
): { incident: UserIncidentView; ticket?: ServiceTicket } => {
  const gate = canReportIncident(store, userId, req.orderId);
  if (!gate.allowed) throw new Error(gate.message);

  const order = store.orders.find((o) => o.id === req.orderId)!;
  const vehicle = store.vehicles.find((v) => v.id === order.vehicleId);
  const { serviceContext, responsibleParty } = resolveIncidentContext(order);

  const incident: Incident = {
    id: `inc-${Date.now()}`,
    orderId: order.id,
    vehicleId: order.vehicleId,
    plateNumber: order.plateNumber,
    userId: order.userId,
    status: "REPORTED",
    incidentType: req.incidentType.trim(),
    location: req.location.trim(),
    incidentAt: req.incidentAt,
    reportedAt: ts(),
    reporterPhone: req.reporterPhone.trim(),
    description: req.description?.trim(),
    hasInjury: Boolean(req.hasInjury),
    policeReportNo: req.policeReportNo?.trim(),
    insuranceStatus: "NOT_REPORTED",
    responsibleParty,
    serviceContext,
    vehicleHold: Boolean(req.vehicleHold),
    estimatedCost: 0,
    pauseBilling: req.pauseBilling !== false
  };

  store.incidents.unshift(incident);

  const orderIdx = store.orders.findIndex((o) => o.id === order.id);
  if (orderIdx >= 0) {
    store.orders[orderIdx] = { ...store.orders[orderIdx], incidentPending: true };
  }

  if (req.vehicleHold !== false && vehicle) {
    const vIdx = store.vehicles.findIndex((v) => v.id === vehicle.id);
    if (vIdx >= 0) {
      store.vehicles[vIdx] = { ...store.vehicles[vIdx], status: "ACCIDENT_HOLD" };
    }
  }

  const ticket: ServiceTicket = {
    id: `tk-${Date.now()}`,
    ticketNo: `CS${Date.now().toString().slice(-9)}`,
    userId: order.userId,
    orderId: order.id,
    category: req.hasInjury ? "人伤事故" : "事故咨询",
    subject: `租期事故上报 · ${order.orderNo} · ${req.incidentType}`,
    status: "OPEN",
    priority: req.hasInjury ? "HIGH" : "HIGH",
    createdAt: ts()
  };
  store.tickets.unshift(ticket);

  return { incident: enrichIncident(store, incident), ticket };
};

export const getIncidentById = (
  store: PreviewStore,
  incidentId: string,
  options?: { userId?: string; admin?: boolean; client?: "h5" | "admin" }
): IncidentDetail | null => {
  const raw = store.incidents.find((i) => i.id === incidentId);
  if (!raw) return null;
  if (options?.userId && !options.admin && !userCanSeeIncident(store, options.userId, raw)) {
    return null;
  }

  const incident = enrichIncident(store, raw);
  const order = store.orders.find((o) => o.id === incident.orderId);
  const vehicle = store.vehicles.find((v) => v.id === incident.vehicleId);
  const user = order ? store.users.find((u) => u.id === order.userId) : undefined;
  const relatedTickets = store.tickets
    .filter((t) => t.orderId === incident.orderId)
    .map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt
    }));

  return {
    incident,
    order: order
      ? {
          id: order.id,
          orderNo: order.orderNo,
          status: order.status,
          serviceMode: order.serviceMode,
          pickupTime: order.pickupTime,
          returnTime: order.returnTime,
          incidentPending: order.incidentPending
        }
      : null,
    vehicle: vehicle
      ? {
          id: vehicle.id,
          plateNumber: vehicle.plateNumber,
          brand: vehicle.brand,
          model: vehicle.model,
          status: vehicle.status
        }
      : null,
    user: user
      ? { id: user.id, realName: user.realName, phone: user.phone }
      : null,
    relatedTickets,
    relations: {
      orderHref: `/orders/${incident.orderId}`,
      vehicleHref: vehicle
        ? options?.client === "h5"
          ? `/vehicles/${vehicle.id}`
          : `/vehicles/${vehicle.id}/history`
        : null,
      userHref: options?.admin && user ? `/users?highlight=${user.id}` : null
    }
  };
};

export const refreshAllIncidentEnrichment = (store: PreviewStore): void => {
  store.incidents = store.incidents.map((raw) => {
    const order = store.orders.find((o) => o.id === raw.orderId);
    if (!order) return raw;
    const { serviceContext, responsibleParty } = resolveIncidentContext(order);
    return {
      ...raw,
      userId: raw.userId ?? order.userId,
      plateNumber: raw.plateNumber ?? order.plateNumber,
      serviceContext: raw.serviceContext ?? serviceContext,
      responsibleParty: raw.responsibleParty ?? responsibleParty
    };
  });
};
