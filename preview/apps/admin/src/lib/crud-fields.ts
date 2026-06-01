import type { CrudFieldDef } from "../components/shared/FormDialog";
import type { BatchAction } from "../components/shared/CrudToolbar";
import {
  orderStatusLabel,
  ticketStatusLabel,
  vehicleStatusLabel,
  pricingRuleStatusLabel,
  billingModeLabel,
  serviceModeLabel,
  timeUnitLabel,
  orgStatusLabel,
  invoiceStatusLabel,
} from "@rental-preview/shared";

const selectFrom = (record: Record<string, string>) =>
  Object.entries(record).map(([value, label]) => ({ value, label }));

export const vehicleCrudFields: CrudFieldDef[] = [
  { key: "plateNumber", label: "车牌", required: true },
  { key: "brand", label: "品牌", required: true },
  { key: "model", label: "型号", required: true },
  { key: "city", label: "城市", required: true },
  {
    key: "vehicleTypeId",
    label: "车型",
    type: "select",
    options: [
      { value: "ECONOMY", label: "经济型" },
      { value: "SEDAN", label: "轿车" },
      { value: "SUV", label: "SUV" },
      { value: "MPV", label: "MPV" },
      { value: "NEW_ENERGY", label: "新能源" }
    ]
  },
  { key: "dailyPrice", label: "日租价", type: "number" },
  { key: "mileage", label: "里程 km", type: "number" },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: selectFrom(vehicleStatusLabel)
  },
  {
    key: "imageUrls",
    label: "车辆展示图",
    type: "image-gallery",
    coverKey: "imageUrl",
    maxImages: 5
  }
];

export const vehicleBatchActions: BatchAction[] = [
  { label: "批量设为可用", patch: { status: "AVAILABLE" } },
  { label: "批量维修中", patch: { status: "MAINTENANCE" } }
];

export const orderCrudFields: CrudFieldDef[] = [
  { key: "orderNo", label: "订单号" },
  { key: "plateNumber", label: "车牌" },
  {
    key: "serviceMode",
    label: "服务方式",
    type: "select",
    options: selectFrom(serviceModeLabel)
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: selectFrom(orderStatusLabel)
  },
  { key: "totalFee", label: "总费用", type: "number" },
  { key: "paidAmount", label: "已付", type: "number" }
];

export const orderBatchActions: BatchAction[] = [
  { label: "批量已确认", patch: { status: "CONFIRMED" } },
  { label: "批量使用中", patch: { status: "IN_USE" } },
  { label: "批量已结算", patch: { status: "SETTLED" } },
  { label: "批量已完成", patch: { status: "COMPLETED" } },
  { label: "批量标记已开发票", patch: { status: "INVOICE_ISSUED" } },
  { label: "批量退款成功", patch: { status: "REFUND_SUCCESS" } }
];

export const pricingCrudFields: CrudFieldDef[] = [
  { key: "name", label: "规则名称", required: true },
  { key: "basePrice", label: "基价", type: "number", required: true },
  { key: "includedKm", label: "含公里", type: "number" },
  { key: "overKmPrice", label: "超公里单价", type: "number" },
  { key: "priority", label: "优先级", type: "number" },
  {
    key: "billingMode",
    label: "计费模式",
    type: "select",
    options: selectFrom(billingModeLabel)
  },
  {
    key: "timeUnit",
    label: "时间单位",
    type: "select",
    options: selectFrom(timeUnitLabel)
  },
  {
    key: "serviceMode",
    label: "服务方式",
    type: "select",
    options: selectFrom(serviceModeLabel)
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: selectFrom(pricingRuleStatusLabel)
  }
];

export const pricingBatchActions: BatchAction[] = [
  { label: "批量启用", patch: { status: "ACTIVE" } },
  { label: "批量停用", patch: { status: "INACTIVE" } }
];

export const couponCrudFields: CrudFieldDef[] = [
  { key: "code", label: "券码", required: true },
  { key: "name", label: "名称", required: true },
  {
    key: "discountType",
    label: "类型",
    type: "select",
    options: [
      { value: "FIXED", label: "固定金额" },
      { value: "PERCENT", label: "折扣%" }
    ]
  },
  { key: "discountValue", label: "优惠值", type: "number" },
  { key: "minOrderAmount", label: "门槛金额", type: "number" },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "ACTIVE", label: "生效" },
      { value: "INACTIVE", label: "停用" }
    ]
  },
  { key: "validTo", label: "有效期至" }
];

export const costCrudFields: CrudFieldDef[] = [
  { key: "category", label: "大类", required: true },
  { key: "subCategory", label: "子类", required: true },
  { key: "amount", label: "金额", type: "number", required: true },
  { key: "period", label: "期间", placeholder: "2026-06" },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "DRAFT", label: "草稿" },
      { value: "CONFIRMED", label: "已确认" },
      { value: "VOID", label: "作废" }
    ]
  },
  { key: "remark", label: "备注", type: "textarea" }
];

export const ticketCrudFields: CrudFieldDef[] = [
  { key: "ticketNo", label: "工单号" },
  { key: "category", label: "分类", required: true },
  { key: "subject", label: "主题", required: true },
  {
    key: "priority",
    label: "优先级",
    type: "select",
    options: [
      { value: "LOW", label: "低" },
      { value: "NORMAL", label: "普通" },
      { value: "HIGH", label: "高" },
      { value: "URGENT", label: "紧急" }
    ]
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: selectFrom(ticketStatusLabel)
  }
];

export const ticketBatchActions: BatchAction[] = [
  { label: "批量分派", patch: { status: "ASSIGNED" } },
  { label: "批量结案", patch: { status: "CLOSED" } }
];

export const incidentCrudFields: CrudFieldDef[] = [
  { key: "orderId", label: "订单 ID" },
  { key: "vehicleId", label: "车辆 ID" },
  { key: "incidentType", label: "事故类型", required: true },
  { key: "location", label: "地点", required: true },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "REPORTED", label: "已上报" },
      { value: "UNDER_REVIEW", label: "审核中" },
      { value: "RESOLVED", label: "已解决" },
      { value: "CLOSED", label: "已关闭" }
    ]
  },
  { key: "estimatedCost", label: "预估费用", type: "number" },
  { key: "pauseBilling", label: "暂停计费", type: "checkbox" }
];

export const driverCrudFields: CrudFieldDef[] = [
  { key: "driverNo", label: "工号" },
  { key: "name", label: "姓名", required: true },
  { key: "phone", label: "手机" },
  { key: "city", label: "城市" },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "AVAILABLE", label: "可用" },
      { value: "ON_DUTY", label: "执勤" },
      { value: "OFF_DUTY", label: "休息" },
      { value: "SUSPENDED", label: "停用" }
    ]
  }
];

export const personnelCrudFields: CrudFieldDef[] = [
  { key: "employeeNo", label: "工号" },
  { key: "name", label: "姓名", required: true },
  { key: "department", label: "部门" },
  {
    key: "role",
    label: "角色",
    type: "select",
    options: [
      { value: "ADMIN", label: "管理员" },
      { value: "OPERATOR", label: "运营" },
      { value: "FINANCE", label: "财务" },
      { value: "CUSTOMER_SERVICE", label: "客服" }
    ]
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "ACTIVE", label: "在职" },
      { value: "INACTIVE", label: "离职" }
    ]
  }
];

export const getOrgMemberCrudFields = (
  orgOptions: { value: string; label: string }[]
): CrudFieldDef[] => [
  {
    key: "orgId",
    label: "所属企业",
    type: "select",
    required: true,
    options: orgOptions
  },
  { key: "phone", label: "手机号", required: true, placeholder: "11 位手机号，可自动开户" },
  { key: "realName", label: "姓名", placeholder: "新用户时必填" },
  { key: "departmentName", label: "部门", required: true },
  {
    key: "roleCodes",
    label: "角色",
    placeholder: "逗号分隔，如 ORG_ADMIN,ORDER_CREATE"
  },
  {
    key: "dataScope",
    label: "数据范围",
    type: "select",
    options: [
      { value: "ORG", label: "全组织" },
      { value: "DEPT", label: "本部门" },
      { value: "SELF", label: "仅本人" }
    ]
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "PENDING", label: "待开通" },
      { value: "ACTIVE", label: "已启用" },
      { value: "DISABLED", label: "已禁用" }
    ]
  }
];

export const orgMemberEditFields: CrudFieldDef[] = [
  { key: "departmentName", label: "部门", required: true },
  {
    key: "roleCodes",
    label: "角色",
    placeholder: "ORG_ADMIN,ORDER_CREATE"
  },
  {
    key: "dataScope",
    label: "数据范围",
    type: "select",
    options: [
      { value: "ORG", label: "全组织" },
      { value: "DEPT", label: "本部门" },
      { value: "SELF", label: "仅本人" }
    ]
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "PENDING", label: "待开通" },
      { value: "ACTIVE", label: "已启用" },
      { value: "DISABLED", label: "已禁用" }
    ]
  }
];

export const orgCrudFields: CrudFieldDef[] = [
  { key: "orgName", label: "企业名称", required: true },
  { key: "creditCode", label: "统一社会信用代码" },
  {
    key: "accountType",
    label: "类型",
    type: "select",
    options: [
      { value: "B", label: "企业" },
      { value: "G", label: "政务" }
    ]
  },
  { key: "creditLimit", label: "授信额度", type: "number" },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "PENDING", label: "待激活" },
      { value: "ACTIVE", label: "启用" },
      { value: "FROZEN", label: "冻结" }
    ]
  },
  { key: "contactName", label: "联系人", required: true },
  { key: "contactPhone", label: "联系电话", required: true },
  { key: "billingPeriodDays", label: "账期(天)", type: "number" },
  { key: "paymentReferenceCode", label: "回款识别码" }
];

export const orgFilterFields = [
  { key: "orgName", label: "企业名称", type: "text" as const, placeholder: "物流 / 机关" },
  {
    key: "accountType",
    label: "客户类型",
    type: "select" as const,
    options: [
      { value: "B", label: "企业 B" },
      { value: "G", label: "政务 G" }
    ]
  },
  {
    key: "status",
    label: "状态",
    type: "select" as const,
    options: selectFrom(orgStatusLabel)
  }
];

export const orgMemberFilterFields = [
  { key: "orgName", label: "企业名称", type: "text" as const },
  { key: "phone", label: "手机号", type: "text" as const },
  { key: "departmentName", label: "部门", type: "text" as const },
  {
    key: "status",
    label: "成员状态",
    type: "select" as const,
    options: [
      { value: "PENDING", label: "待开通" },
      { value: "ACTIVE", label: "已启用" },
      { value: "DISABLED", label: "已禁用" }
    ]
  }
];

export const userCrudFields: CrudFieldDef[] = [
  { key: "phone", label: "手机号", required: true },
  { key: "realName", label: "姓名", required: true },
  {
    key: "status",
    label: "账户状态",
    type: "select",
    options: [
      { value: "ACTIVE", label: "正常" },
      { value: "SUSPENDED", label: "冻结" },
      { value: "BLACKLIST", label: "黑名单" }
    ]
  }
];

export const userBatchActions: BatchAction[] = [
  { label: "批量冻结", patch: { status: "SUSPENDED" } },
  { label: "批量恢复正常", patch: { status: "ACTIVE" } }
];

export const refundCrudFields: CrudFieldDef[] = [
  { key: "orderId", label: "订单 ID" },
  { key: "amount", label: "金额", type: "number" },
  { key: "reason", label: "原因", type: "textarea" },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "PENDING", label: "待审" },
      { value: "APPROVED", label: "通过" },
      { value: "REJECTED", label: "驳回" },
      { value: "COMPLETED", label: "已退款" }
    ]
  }
];

export const refundBatchActions: BatchAction[] = [
  { label: "批量通过", patch: { status: "APPROVED" } },
  { label: "批量退款完成", patch: { status: "COMPLETED" } },
  { label: "批量驳回", patch: { status: "REJECTED" } }
];

export const mapPolicyCrudFields: CrudFieldDef[] = [
  {
    key: "scene",
    label: "场景",
    type: "select",
    options: [
      { value: "BOOKING_PICKUP", label: "约车选点" },
      { value: "GPS_TRACK", label: "轨迹展示" }
    ]
  },
  {
    key: "mode",
    label: "模式",
    type: "select",
    options: [
      { value: "MAP_DIRECT", label: "地图直连" },
      { value: "GPS_PASSTHROUGH", label: "GPS 透传" }
    ]
  },
  { key: "provider", label: "供应商" },
  { key: "commercialLicensed", label: "商用授权", type: "checkbox" }
];

export const maintenanceCrudFields: CrudFieldDef[] = [
  { key: "plateNumber", label: "车牌", required: true },
  { key: "title", label: "事项", required: true },
  {
    key: "orderType",
    label: "类型",
    type: "select",
    options: [
      { value: "ROUTINE", label: "保养" },
      { value: "REPAIR", label: "维修" }
    ]
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "SCHEDULED", label: "已排期" },
      { value: "IN_PROGRESS", label: "进行中" },
      { value: "COMPLETED", label: "已完成" }
    ]
  },
  { key: "estimatedCost", label: "预估费用", type: "number" }
];

export const approvalCrudFields: CrudFieldDef[] = [
  { key: "orgId", label: "组织 ID" },
  {
    key: "approvalType",
    label: "类型",
    type: "select",
    options: [
      { value: "MEMBER_OPEN", label: "成员开通" },
      { value: "ROLE_CHANGE", label: "角色变更" },
      { value: "BILL_CONFIRM", label: "账单确认" }
    ]
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "PENDING", label: "待审" },
      { value: "APPROVED", label: "通过" },
      { value: "REJECTED", label: "驳回" }
    ]
  },
  { key: "reason", label: "说明", type: "textarea" }
];

export const approvalBatchActions: BatchAction[] = [
  { label: "批量通过", patch: { status: "APPROVED" } },
  { label: "批量驳回", patch: { status: "REJECTED" } }
];

export const billCrudFields: CrudFieldDef[] = [
  { key: "billNo", label: "账单号" },
  { key: "billingPeriod", label: "账期", required: true },
  { key: "totalAmount", label: "应付总额", type: "number" },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "PENDING_CONFIRM", label: "待确认" },
      { value: "PENDING_PAYMENT", label: "待付款" },
      { value: "PAID", label: "已结清" },
      { value: "OVERDUE", label: "逾期" }
    ]
  },
  { key: "paymentReferenceCode", label: "回款识别码" }
];

export const invoiceCrudFields: CrudFieldDef[] = [
  { key: "invoiceTitle", label: "抬头", required: true },
  { key: "taxNo", label: "税号" },
  { key: "email", label: "邮箱" },
  { key: "amount", label: "金额", type: "number" },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: selectFrom(invoiceStatusLabel)
  },
  { key: "orderId", label: "订单 ID" }
];
