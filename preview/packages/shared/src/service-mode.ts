import type { PerVehicleServiceMode, ServiceMode } from "./types";
import type { VehicleCartItem } from "./vehicle-cart";

export type ServiceModeMeta = {
  mode: ServiceMode;
  title: string;
  subtitle: string;
  needLicense: boolean;
  needRealname: boolean;
  bullets: string[];
};

export const SERVICE_MODE_META: Record<ServiceMode, ServiceModeMeta> = {
  SELF_DRIVE: {
    mode: "SELF_DRIVE",
    title: "自驾",
    subtitle: "客户本人驾驶",
    needLicense: true,
    needRealname: true,
    bullets: [
      "须完成实名认证",
      "须上传驾驶证并通过平台审核",
      "证件在有效期内方可下单",
      "取车时须出示本人驾照原件"
    ]
  },
  WITH_DRIVER: {
    mode: "WITH_DRIVER",
    title: "包车带司机",
    subtitle: "平台安排专业司机",
    needLicense: false,
    needRealname: true,
    bullets: [
      "无需上传客户驾驶证",
      "须完成实名认证（企业客户按授信规则）",
      "下单后平台分配司机，含司机服务费",
      "适合商务接待、会务、政企用车"
    ]
  },
  MIXED: {
    mode: "MIXED",
    title: "部分带司机+自驾",
    subtitle: "多车组合或分时段司机+自驾",
    needLicense: true,
    needRealname: true,
    bullets: [
      "含自驾车辆时须完成驾照认证",
      "多车场景：租车篮内分别勾选自驾/包车即可",
      "分时段场景：按约定含部分司机服务天数（演示按约 45% 司机费）",
      "适合车队部分配司机、部分客户自驾"
    ]
  }
};

/** 下单页三选一（订单级） */
export const ORDER_LEVEL_SERVICE_MODES: ServiceMode[] = [
  "SELF_DRIVE",
  "WITH_DRIVER",
  "MIXED"
];

/** 首页/租车篮每台车二选一 */
export const PER_VEHICLE_SERVICE_MODES: PerVehicleServiceMode[] = ["SELF_DRIVE", "WITH_DRIVER"];

export const needsLicenseForServiceMode = (mode: ServiceMode) =>
  SERVICE_MODE_META[mode].needLicense;

export const isPerVehicleServiceMode = (mode: string): mode is PerVehicleServiceMode =>
  mode === "SELF_DRIVE" || mode === "WITH_DRIVER";

export const normalizePerVehicleServiceMode = (mode?: string): PerVehicleServiceMode =>
  mode === "WITH_DRIVER" ? "WITH_DRIVER" : "SELF_DRIVE";

/** 租车篮是否同时含自驾与包车（即混合服务） */
export const isCartServiceMixed = (items: Pick<VehicleCartItem, "serviceMode">[]): boolean => {
  const hasSelf = items.some((i) => i.serviceMode === "SELF_DRIVE");
  const hasDriver = items.some((i) => i.serviceMode === "WITH_DRIVER");
  return hasSelf && hasDriver;
};

/** 根据租车篮推导展示用订单服务类型 */
export const deriveServiceModeFromCart = (
  items: Pick<VehicleCartItem, "serviceMode">[]
): ServiceMode => {
  if (items.length === 0) return "SELF_DRIVE";
  if (isCartServiceMixed(items)) return "MIXED";
  return items[0]!.serviceMode === "WITH_DRIVER" ? "WITH_DRIVER" : "SELF_DRIVE";
};
