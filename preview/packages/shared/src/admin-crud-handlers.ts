import { reconcileOrderStatusInStore } from "./order-status";
import { normalizeVehicleImages, resolveVehicleImageUrl } from "./vehicle-images";
import type { Vehicle } from "./types";
import type { PreviewStore } from "./store";
import type { ApiResponse, Refund } from "./types";

const ts = () => new Date().toISOString();

type Entity = { id: string };

type ResourceDef = {
  storeKey: keyof PreviewStore;
  idPrefix: string;
  create: (body: Record<string, unknown>) => Entity;
};

const defs: Record<string, ResourceDef> = {
  vehicles: {
    storeKey: "vehicles",
    idPrefix: "veh-",
    create: (b) => ({
      id: "",
      plateNumber: String(b.plateNumber ?? "沪A00000"),
      vehicleTypeId: String(b.vehicleTypeId ?? "SEDAN"),
      city: String(b.city ?? "上海"),
      storeId: String(b.storeId ?? "store-sh-001"),
      dailyPrice: Number(b.dailyPrice ?? 399),
      status: (b.status as "AVAILABLE") ?? "AVAILABLE",
      brand: String(b.brand ?? "品牌"),
      model: String(b.model ?? "车型"),
      vin: String(b.vin ?? `VIN${Date.now()}`),
      mileage: Number(b.mileage ?? 10000),
      lastMaintenanceMileageKm: Number(b.lastMaintenanceMileageKm ?? 0),
      maintenanceIntervalKm: 10000,
      imageUrl: resolveVehicleImageUrl(String(b.imageUrl ?? ""), {
        vehicleTypeId: String(b.vehicleTypeId ?? "SEDAN"),
        seed: Date.now() % 1000
      }),
      imageUrls: b.imageUrls
        ? (b.imageUrls as string[]).map((u, i) =>
            resolveVehicleImageUrl(String(u), {
              vehicleTypeId: String(b.vehicleTypeId ?? "SEDAN"),
              seed: i
            })
          )
        : undefined,
      insuranceExpiryDate: String(b.insuranceExpiryDate ?? "2027-12-31"),
      annualReviewExpiryDate: String(b.annualReviewExpiryDate ?? "2027-06-30")
    })
  },
  orders: {
    storeKey: "orders",
    idPrefix: "order-",
    create: (b) => ({
      id: "",
      orderNo: `ORD${Date.now()}`,
      userId: String(b.userId ?? ""),
      vehicleId: String(b.vehicleId ?? ""),
      plateNumber: String(b.plateNumber ?? "—"),
      vehicleTypeId: String(b.vehicleTypeId ?? "SEDAN"),
      pickupStoreId: String(b.pickupStoreId ?? ""),
      returnStoreId: String(b.returnStoreId ?? ""),
      pickupTime: String(b.pickupTime ?? ts()),
      returnTime: String(b.returnTime ?? ts()),
      status: (b.status as "PENDING_PAYMENT") ?? "PENDING_PAYMENT",
      settlementMode: (b.settlementMode as "PREPAID") ?? "PREPAID",
      serviceMode: (b.serviceMode as "SELF_DRIVE") ?? "SELF_DRIVE",
      accountType: (b.accountType as "C") ?? "C",
      estimatedFee: Number(b.estimatedFee ?? 0),
      totalFee: Number(b.totalFee ?? 0),
      paidAmount: 0
    })
  },
  "pricing-rules": {
    storeKey: "pricingRules",
    idPrefix: "prc-",
    create: (b) => ({
      id: "",
      name: String(b.name ?? "新定价规则"),
      billingMode: (b.billingMode as "HYBRID") ?? "HYBRID",
      timeUnit: (b.timeUnit as "DAY") ?? "DAY",
      basePrice: Number(b.basePrice ?? 399),
      includedKm: Number(b.includedKm ?? 200),
      overKmPrice: Number(b.overKmPrice ?? 2),
      serviceMode: (b.serviceMode as "SELF_DRIVE") ?? "SELF_DRIVE",
      priority: Number(b.priority ?? 50),
      effectiveFrom: String(b.effectiveFrom ?? "2026-06-01"),
      status: (b.status as "ACTIVE") ?? "ACTIVE"
    })
  },
  coupons: {
    storeKey: "coupons",
    idPrefix: "cpn-",
    create: (b) => ({
      id: "",
      code: String(b.code ?? `CPN${Date.now()}`),
      name: String(b.name ?? "新优惠券"),
      discountType: (b.discountType as "FIXED") ?? "FIXED",
      discountValue: Number(b.discountValue ?? 50),
      minOrderAmount: Number(b.minOrderAmount ?? 0),
      status: (b.status as "ACTIVE") ?? "ACTIVE",
      validTo: String(b.validTo ?? "2026-12-31")
    })
  },
  "operating-costs": {
    storeKey: "costs",
    idPrefix: "cost-",
    create: (b) => ({
      id: "",
      category: String(b.category ?? "VEHICLE"),
      subCategory: String(b.subCategory ?? "OTHER"),
      amount: Number(b.amount ?? 0),
      period: String(b.period ?? "2026-06"),
      status: (b.status as "DRAFT") ?? "DRAFT",
      createdAt: ts(),
      remark: b.remark ? String(b.remark) : undefined
    })
  },
  tickets: {
    storeKey: "tickets",
    idPrefix: "tkt-",
    create: (b) => ({
      id: "",
      ticketNo: `TKT${Date.now()}`,
      userId: String(b.userId ?? "a1000001-0001-4000-8000-000000000001"),
      category: String(b.category ?? "咨询"),
      subject: String(b.subject ?? "新工单"),
      status: (b.status as "OPEN") ?? "OPEN",
      priority: (b.priority as "NORMAL") ?? "NORMAL",
      createdAt: ts()
    })
  },
  incidents: {
    storeKey: "incidents",
    idPrefix: "inc-",
    create: (b) => ({
      id: "",
      orderId: String(b.orderId ?? ""),
      vehicleId: String(b.vehicleId ?? ""),
      incidentType: String(b.incidentType ?? "刮蹭"),
      location: String(b.location ?? "待填写"),
      status: (b.status as "REPORTED") ?? "REPORTED",
      reportedAt: ts(),
      estimatedCost: Number(b.estimatedCost ?? 0),
      pauseBilling: Boolean(b.pauseBilling ?? true)
    })
  },
  drivers: {
    storeKey: "drivers",
    idPrefix: "drv-",
    create: (b) => ({
      id: "",
      driverNo: String(b.driverNo ?? `D${Date.now()}`),
      name: String(b.name ?? "新司机"),
      phone: String(b.phone ?? "13800000000"),
      licenseNo: String(b.licenseNo ?? ""),
      licenseType: String(b.licenseType ?? "A1"),
      city: String(b.city ?? "上海"),
      status: (b.status as "AVAILABLE") ?? "AVAILABLE",
      rating: Number(b.rating ?? 5)
    })
  },
  personnel: {
    storeKey: "personnel",
    idPrefix: "per-",
    create: (b) => ({
      id: "",
      employeeNo: String(b.employeeNo ?? `E${Date.now()}`),
      name: String(b.name ?? "新员工"),
      phone: String(b.phone ?? "13900000000"),
      role: (b.role as "OPERATOR") ?? "OPERATOR",
      department: String(b.department ?? "运营部"),
      storeScope: ["store-sh-001"],
      status: (b.status as "ACTIVE") ?? "ACTIVE"
    })
  },
  orgs: {
    storeKey: "orgs",
    idPrefix: "org-",
    create: (b) => ({
      id: "",
      orgName: String(b.orgName ?? "新组织"),
      accountType: (b.accountType as "B") ?? "B",
      creditCode: String(b.creditCode ?? ""),
      status: (b.status as "PENDING") ?? "PENDING",
      creditLimit: Number(b.creditLimit ?? 100000),
      usedAmount: 0,
      billingPeriodDays: Number(b.billingPeriodDays ?? 30),
      contactName: String(b.contactName ?? ""),
      contactPhone: String(b.contactPhone ?? ""),
      paymentReferenceCode: String(
        b.paymentReferenceCode ?? `ORG-${Date.now().toString(36).toUpperCase()}`
      )
    })
  },
  users: {
    storeKey: "users",
    idPrefix: "user-",
    create: (b) => ({
      id: "",
      phone: String(b.phone ?? `13${Date.now().toString().slice(-9)}`),
      realName: String(b.realName ?? "新用户"),
      status: (b.status as "ACTIVE") ?? "ACTIVE",
      realNameStatus: "NONE",
      licenseStatus: "NONE",
      licenseVerifyStatus: "NONE",
      registeredAt: ts()
    })
  },
  "maintenance-orders": {
    storeKey: "maintenanceOrders",
    idPrefix: "mo-",
    create: (b) => ({
      id: "",
      workOrderNo: `MO${Date.now()}`,
      vehicleId: String(b.vehicleId ?? ""),
      plateNumber: String(b.plateNumber ?? ""),
      orderType: (b.orderType as "ROUTINE") ?? "ROUTINE",
      status: (b.status as "SCHEDULED") ?? "SCHEDULED",
      title: String(b.title ?? "保养工单"),
      estimatedCost: Number(b.estimatedCost ?? 0),
      scheduledAt: ts(),
      storeId: String(b.storeId ?? "store-sh-001")
    })
  },
  "map-policies": {
    storeKey: "mapPolicies",
    idPrefix: "map-",
    create: (b) => ({
      id: "",
      scene: (b.scene as "BOOKING_PICKUP") ?? "BOOKING_PICKUP",
      mode: (b.mode as "MAP_DIRECT") ?? "MAP_DIRECT",
      provider: String(b.provider ?? "amap"),
      commercialLicensed: Boolean(b.commercialLicensed ?? false)
    })
  },
  stores: {
    storeKey: "stores",
    idPrefix: "store-",
    create: (b) => ({
      id: "",
      name: String(b.name ?? "新门店"),
      city: String(b.city ?? "上海"),
      address: String(b.address ?? ""),
      phone: String(b.phone ?? "")
    })
  },
  refunds: {
    storeKey: "refunds",
    idPrefix: "ref-",
    create: (b) => ({
      id: "",
      orderId: String(b.orderId ?? ""),
      amount: Number(b.amount ?? 0),
      reason: String(b.reason ?? ""),
      status: (b.status as "PENDING") ?? "PENDING",
      createdAt: ts()
    })
  },
  payments: {
    storeKey: "payments",
    idPrefix: "pay-",
    create: (b) => ({
      id: "",
      orderId: String(b.orderId ?? ""),
      channel: (b.channel as "wechat") ?? "wechat",
      channelTxnNo: `TXN${Date.now()}`,
      amount: Number(b.amount ?? 0),
      status: (b.status as "PENDING") ?? "PENDING",
      settlementMode: (b.settlementMode as "PREPAID") ?? "PREPAID",
      createdAt: ts()
    })
  },
  bills: {
    storeKey: "bills",
    idPrefix: "bill-",
    create: (b) => ({
      id: "",
      billNo: `BILL${Date.now()}`,
      billingAccountId: String(b.billingAccountId ?? ""),
      accountType: (b.accountType as "B") ?? "B",
      billingPeriod: String(b.billingPeriod ?? "2026-06"),
      totalAmount: Number(b.totalAmount ?? 0),
      paidAmount: 0,
      status: (b.status as "PENDING_CONFIRM") ?? "PENDING_CONFIRM",
      dueDate: String(b.dueDate ?? "2026-07-01"),
      reconciliationStatus: "PENDING" as const,
      paymentReferenceCode: String(b.paymentReferenceCode ?? "")
    })
  },
  invoices: {
    storeKey: "invoices",
    idPrefix: "inv-",
    create: (b) => ({
      id: "",
      titleType: (b.titleType as "COMPANY") ?? "COMPANY",
      invoiceTitle: String(b.invoiceTitle ?? ""),
      amount: Number(b.amount ?? 0),
      status: (b.status as "PENDING") ?? "PENDING",
      createdAt: ts(),
      email: b.email ? String(b.email) : undefined
    })
  },
  approvals: {
    storeKey: "approvals",
    idPrefix: "apr-",
    create: (b) => ({
      id: "",
      orgId: String(b.orgId ?? ""),
      approvalType: (b.approvalType as "MEMBER_OPEN") ?? "MEMBER_OPEN",
      targetMemberId: String(b.targetMemberId ?? ""),
      status: (b.status as "PENDING") ?? "PENDING",
      createdAt: ts()
    })
  },
  "bank-transactions": {
    storeKey: "bankTxns",
    idPrefix: "btx-",
    create: (b) => ({
      id: "",
      txnNo: `BTX${Date.now()}`,
      payerName: String(b.payerName ?? ""),
      amount: Number(b.amount ?? 0),
      referenceCode: b.referenceCode ? String(b.referenceCode) : undefined,
      status: (b.status as "UNMATCHED") ?? "UNMATCHED",
      txnAt: ts()
    })
  },
  "org-members": {
    storeKey: "orgMembers",
    idPrefix: "om-",
    create: (b) => ({
      id: "",
      orgId: String(b.orgId ?? ""),
      userId: String(b.userId ?? ""),
      departmentName: String(b.departmentName ?? "默认部门"),
      roleCodes: Array.isArray(b.roleCodes)
        ? (b.roleCodes as string[])
        : typeof b.roleCodes === "string" && b.roleCodes
          ? String(b.roleCodes)
              .split(/[,，\s]+/)
              .map((s) => s.trim())
              .filter(Boolean)
          : ["MEMBER"],
      dataScope: (b.dataScope as "ORG") ?? "ORG",
      status: (b.status as "PENDING") ?? "PENDING"
    })
  }
};

const getArray = (s: PreviewStore, resource: string): Entity[] | null => {
  const def = defs[resource];
  if (!def) return null;
  const arr = s[def.storeKey];
  return Array.isArray(arr) ? (arr as Entity[]) : null;
};

const assignId = (resource: string, entity: Entity): Entity => {
  const def = defs[resource]!;
  return { ...entity, id: entity.id || `${def.idPrefix}${Date.now()}` };
};

export type AdminCrudResult = ApiResponse<unknown> | null;

export const tryHandleAdminCrud = (
  method: string,
  pathname: string,
  body: unknown,
  s: PreviewStore,
  ok: <T>(data: T, message?: string) => ApiResponse<T>,
  fail: <T>(code: number, message: string, data?: T | null) => ApiResponse<T | null>
): AdminCrudResult => {
  const batchDelete = pathname.match(/^\/api\/v1\/admin\/([a-z-]+)\/batch-delete$/);
  if (method === "POST" && batchDelete) {
    const resource = batchDelete[1];
    const arr = getArray(s, resource);
    if (!arr) return fail(404, "资源不存在");
    const { ids } = body as { ids: string[] };
    const set = new Set(ids ?? []);
    const kept = arr.filter((x) => !set.has(x.id));
    const removed = arr.length - kept.length;
    arr.splice(0, arr.length, ...kept);
    return ok({ deleted: removed, ids }, `已批量删除 ${removed} 条`);
  }

  const batchUpdate = pathname.match(/^\/api\/v1\/admin\/([a-z-]+)\/batch-update$/);
  if (method === "POST" && batchUpdate) {
    const resource = batchUpdate[1];
    const arr = getArray(s, resource);
    if (!arr) return fail(404, "资源不存在");
    const { ids, patch } = body as { ids: string[]; patch: Record<string, unknown> };
    const set = new Set(ids ?? []);
    let updated = 0;
    arr.forEach((item) => {
      if (set.has(item.id)) {
        Object.assign(item, patch);
        if (resource === "refunds") {
          const refund = item as Refund;
          if (refund.orderId) reconcileOrderStatusInStore(s, refund.orderId);
        }
        if (resource === "invoices") {
          const inv = item as { orderId?: string };
          if (inv.orderId) reconcileOrderStatusInStore(s, inv.orderId);
        }
        updated += 1;
      }
    });
    return ok({ updated, ids }, `已批量更新 ${updated} 条`);
  }

  const itemPath = pathname.match(/^\/api\/v1\/admin\/([a-z-]+)\/([^/]+)$/);
  if (itemPath) {
    const resource = itemPath[1];
    const id = itemPath[2];
    const arr = getArray(s, resource);
    if (!arr) return null;
    const idx = arr.findIndex((x) => x.id === id);

    if (method === "GET") {
      if (idx < 0) return fail(1004, "记录不存在");
      if (resource === "vehicles") {
        return ok(normalizeVehicleImages(arr[idx] as Vehicle));
      }
      return ok(arr[idx]);
    }
    if (method === "PUT" || method === "PATCH") {
      if (idx < 0) return fail(1004, "记录不存在");
      const patch = (body ?? {}) as Record<string, unknown>;
      delete patch.id;
      Object.assign(arr[idx], patch);
      if (resource === "vehicles") {
        arr[idx] = normalizeVehicleImages(arr[idx] as Vehicle);
      }
      if (resource === "refunds") {
        const refund = arr[idx] as Refund;
        if (refund.orderId) reconcileOrderStatusInStore(s, refund.orderId);
      }
      if (resource === "invoices") {
        const inv = arr[idx] as { orderId?: string };
        if (inv.orderId) reconcileOrderStatusInStore(s, inv.orderId);
      }
      return ok(arr[idx], "更新成功");
    }
    if (method === "DELETE") {
      if (idx < 0) return fail(1004, "记录不存在");
      const [removed] = arr.splice(idx, 1);
      return ok(removed, "删除成功");
    }
    return null;
  }

  const createPath = pathname.match(/^\/api\/v1\/admin\/([a-z-]+)$/);
  if (method === "POST" && createPath) {
    const resource = createPath[1];
    const def = defs[resource];
    if (!def) return null;
    const arr = getArray(s, resource);
    if (!arr) return null;
    let entity = assignId(resource, def.create((body ?? {}) as Record<string, unknown>) as Entity);
    if (resource === "vehicles") {
      entity = normalizeVehicleImages(entity as Vehicle) as Entity;
    }
    arr.unshift(entity);
    return ok(entity, "创建成功");
  }

  return null;
};

export const ADMIN_CRUD_RESOURCES = Object.keys(defs);
