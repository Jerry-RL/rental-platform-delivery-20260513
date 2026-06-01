import type { PreviewStore } from "./store";
import {
  buildOrderStatusBadges,
  syncOrderStatusFromRelations,
  type OrderStatusBadge
} from "./order-status";
import { resolveVehicleImageUrl, vehicleImageSeed } from "./vehicle-images";
import type {
  Driver,
  Invoice,
  Order,
  OrderFeeDetail,
  OrgAccount,
  Payment,
  PricingRule,
  Refund,
  ServiceTicket,
  Store,
  User,
  UserIncidentView,
  UserViolationView,
  Vehicle
} from "./types";
import { listOrderIncidents } from "./incident-rules";
import { listOrderViolations } from "./violation-attribution";

export type OrderDetailRelations = {
  userId: string | null;
  vehicleId: string | null;
  driverId: string | null;
  userHref: string | null;
  vehicleHref: string | null;
  driverHref: string | null;
};

export type OrderDetail = {
  order: Order;
  relations: OrderDetailRelations;
  statusBadges: OrderStatusBadge[];
  user: Pick<User, "id" | "phone" | "realName" | "status" | "realNameStatus"> | null;
  org: Pick<OrgAccount, "id" | "orgName" | "accountType" | "contactName" | "contactPhone"> | null;
  pickupStore: Pick<Store, "id" | "name" | "city" | "address" | "phone"> | null;
  returnStore: Pick<Store, "id" | "name" | "city" | "address" | "phone"> | null;
  vehicle: Pick<
    Vehicle,
    "id" | "plateNumber" | "vehicleTypeId" | "brand" | "model" | "status" | "mileage" | "imageUrl"
  > | null;
  driver: Pick<Driver, "id" | "driverNo" | "name" | "phone" | "status"> | null;
  pricingRule: PricingRule | null;
  payments: Payment[];
  refunds: Refund[];
  incidents: UserIncidentView[];
  tickets: ServiceTicket[];
  invoices: Invoice[];
  violations: UserViolationView[];
};

const synthesizeFeeDetails = (order: Order): OrderFeeDetail[] => {
  if (order.feeDetails?.length) return order.feeDetails;
  const details: OrderFeeDetail[] = [];
  const rental = Math.max(0, order.totalFee - order.chauffeurFee);
  details.push({
    id: `fd-${order.id}-rental`,
    orderId: order.id,
    feeType: "RENTAL",
    amount: rental,
    remark: order.estimatedFee !== order.totalFee ? "结算前为预估金额" : undefined
  });
  if (order.chauffeurFee > 0) {
    details.push({
      id: `fd-${order.id}-driver`,
      orderId: order.id,
      feeType: "DRIVER",
      amount: order.chauffeurFee
    });
  }
  if (order.pickupStoreId !== order.returnStoreId && order.totalFee > order.estimatedFee) {
    const extra = order.totalFee - order.estimatedFee;
    if (extra > 0) {
      details.push({
        id: `fd-${order.id}-cross`,
        orderId: order.id,
        feeType: "CROSS_STORE",
        amount: extra,
        remark: "异店还车（推算）"
      });
    }
  }
  return details;
};

export const buildOrderDetail = (store: PreviewStore, orderId: string): OrderDetail | null => {
  const raw = store.orders.find((o) => o.id === orderId);
  if (!raw) return null;

  const synced = syncOrderStatusFromRelations(store, raw);
  const order: Order = {
    ...synced,
    feeDetails: synthesizeFeeDetails(synced)
  };
  const statusBadges = buildOrderStatusBadges(store, order);

  const user = store.users.find((u) => u.id === order.userId) ?? null;
  const org =
    order.billingAccountId != null
      ? store.orgs.find((o) => o.id === order.billingAccountId) ?? null
      : null;
  const pickupStore = store.stores.find((s) => s.id === order.pickupStoreId) ?? null;
  const returnStore = store.stores.find((s) => s.id === order.returnStoreId) ?? null;
  const vehicle = store.vehicles.find((v) => v.id === order.vehicleId) ?? null;
  const driver = order.driverId ? store.drivers.find((d) => d.id === order.driverId) ?? null : null;
  const pricingRule = order.pricingRuleSnapshotId
    ? store.pricingRules.find((r) => r.id === order.pricingRuleSnapshotId) ?? null
    : null;

  const relations: OrderDetailRelations = {
    userId: user?.id ?? null,
    vehicleId: vehicle?.id ?? null,
    driverId: driver?.id ?? null,
    userHref: user ? `/users?highlight=${user.id}` : null,
    vehicleHref: vehicle ? `/vehicles/${vehicle.id}/history` : null,
    driverHref: driver ? `/staff/drivers/${driver.id}` : null
  };

  return {
    order,
    relations,
    statusBadges,
    user: user
      ? {
          id: user.id,
          phone: user.phone,
          realName: user.realName,
          status: user.status,
          realNameStatus: user.realNameStatus
        }
      : null,
    org: org
      ? {
          id: org.id,
          orgName: org.orgName,
          accountType: org.accountType,
          contactName: org.contactName,
          contactPhone: org.contactPhone
        }
      : null,
    pickupStore: pickupStore
      ? {
          id: pickupStore.id,
          name: pickupStore.name,
          city: pickupStore.city,
          address: pickupStore.address,
          phone: pickupStore.phone
        }
      : null,
    returnStore: returnStore
      ? {
          id: returnStore.id,
          name: returnStore.name,
          city: returnStore.city,
          address: returnStore.address,
          phone: returnStore.phone
        }
      : null,
    vehicle: vehicle
      ? {
          id: vehicle.id,
          plateNumber: vehicle.plateNumber,
          vehicleTypeId: vehicle.vehicleTypeId,
          brand: vehicle.brand,
          model: vehicle.model,
          status: vehicle.status,
          mileage: vehicle.mileage,
          imageUrl: resolveVehicleImageUrl(vehicle.imageUrl, {
            vehicleId: vehicle.id,
            vehicleTypeId: vehicle.vehicleTypeId,
            seed: vehicleImageSeed(vehicle.id)
          })
        }
      : null,
    driver: driver
      ? {
          id: driver.id,
          driverNo: driver.driverNo,
          name: driver.name,
          phone: driver.phone,
          status: driver.status
        }
      : null,
    pricingRule,
    payments: store.payments.filter((p) => p.orderId === orderId),
    refunds: store.refunds.filter((r) => r.orderId === orderId),
    incidents: listOrderIncidents(store, orderId),
    tickets: store.tickets.filter((t) => t.orderId === orderId),
    invoices: store.invoices.filter((inv) => inv.orderId === orderId),
    violations: listOrderViolations(store, orderId)
  };
};
