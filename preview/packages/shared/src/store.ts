import {
  seedApprovals,
  seedBankTxns,
  seedBills,
  seedCosts,
  seedCoupons,
  seedDashboard,
  seedDrivers,
  seedGps,
  seedMaintenanceOrders,
  seedMileageRecords,
  seedIncidents,
  seedInvoices,
  seedMapPolicies,
  seedOrders,
  seedOrgMembers,
  seedOrgs,
  seedPayments,
  seedPersonnel,
  seedPricingRules,
  seedRefunds,
  seedStores,
  seedTickets,
  seedUsers,
  seedUserLicenses,
  seedVehicleHistoryEvents,
  seedVehicles,
  seedViolationTasks,
  seedViolations,
  seedViolationQuota
} from "./seed";
import { reconcileAllOrderStatuses } from "./order-status";
import { refreshAllIncidentEnrichment } from "./incident-rules";
import { refreshAllViolationAttribution } from "./violation-attribution";
import { normalizeVehicleImages } from "./vehicle-images";
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

const clone = <T>(items: T[]) => items.map((i) => ({ ...i }));

export const findUserLicense = (licenses: UserLicenseRecord[], userId: string) =>
  licenses.find((l) => l.userId === userId);

export const previewStore = {
  users: clone(seedUsers),
  userLicenses: clone(seedUserLicenses),
  vehicleHistoryEvents: clone(seedVehicleHistoryEvents),
  orgs: clone(seedOrgs),
  orgMembers: clone(seedOrgMembers),
  approvals: clone(seedApprovals),
  stores: clone(seedStores),
  vehicles: clone(seedVehicles).map(normalizeVehicleImages),
  orders: clone(seedOrders),
  payments: clone(seedPayments),
  refunds: clone(seedRefunds),
  bills: clone(seedBills),
  bankTxns: clone(seedBankTxns),
  invoices: clone(seedInvoices),
  incidents: clone(seedIncidents),
  tickets: clone(seedTickets),
  pricingRules: clone(seedPricingRules),
  costs: clone(seedCosts),
  coupons: clone(seedCoupons),
  drivers: clone(seedDrivers),
  personnel: clone(seedPersonnel),
  violationTasks: clone(seedViolationTasks),
  violations: clone(seedViolations),
  violationQuota: { ...seedViolationQuota },
  mileageRecords: clone(seedMileageRecords),
  maintenanceOrders: clone(seedMaintenanceOrders),
  gps: clone(seedGps),
  mapPolicies: clone(seedMapPolicies),
  dashboard: { ...seedDashboard }
};

reconcileAllOrderStatuses(previewStore);
refreshAllViolationAttribution(previewStore);
refreshAllIncidentEnrichment(previewStore);

export const resetPreviewStore = () => {
  Object.assign(previewStore, {
    users: clone(seedUsers),
    userLicenses: clone(seedUserLicenses),
    vehicleHistoryEvents: clone(seedVehicleHistoryEvents),
    orgs: clone(seedOrgs),
    orgMembers: clone(seedOrgMembers),
    approvals: clone(seedApprovals),
    stores: clone(seedStores),
    vehicles: clone(seedVehicles).map(normalizeVehicleImages),
    orders: clone(seedOrders),
    payments: clone(seedPayments),
    refunds: clone(seedRefunds),
    bills: clone(seedBills),
    bankTxns: clone(seedBankTxns),
    invoices: clone(seedInvoices),
    incidents: clone(seedIncidents),
    tickets: clone(seedTickets),
    pricingRules: clone(seedPricingRules),
    costs: clone(seedCosts),
    coupons: clone(seedCoupons),
    drivers: clone(seedDrivers),
    personnel: clone(seedPersonnel),
    violationTasks: clone(seedViolationTasks),
    violations: clone(seedViolations),
    violationQuota: { ...seedViolationQuota },
    mileageRecords: clone(seedMileageRecords),
    maintenanceOrders: clone(seedMaintenanceOrders),
    gps: clone(seedGps),
    mapPolicies: clone(seedMapPolicies),
    dashboard: { ...seedDashboard }
  });
  reconcileAllOrderStatuses(previewStore);
  refreshAllViolationAttribution(previewStore);
};

export type PreviewStore = typeof previewStore;
