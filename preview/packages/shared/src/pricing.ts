import type { PricingRule, ServiceMode, Vehicle } from "./types";

export type BillingMode = "TIME" | "MILEAGE" | "HYBRID";
export type TimeUnit = "HOUR" | "DAY" | "WEEK" | "MONTH";

export type QuoteRequest = {
  /** 指定车辆 ID（优先） */
  vehicleId?: string;
  /** 按车型下单时指定 */
  vehicleTypeId?: string;
  city?: string;
  brand?: string;
  model?: string;
  vehicleQty?: number;
  pickupStoreId: string;
  returnStoreId: string;
  pickupTime: string;
  returnTime: string;
  serviceMode: ServiceMode;
  billingMode?: BillingMode;
  timeUnit?: TimeUnit;
  estimatedKm?: number;
  couponCode?: string;
  accountType?: "C" | "B" | "G";
};

export type QuoteLine = {
  feeType: string;
  label: string;
  amount: number;
  remark?: string;
};

export type OrderQuote = {
  quoteId: string;
  validUntil: string;
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  vehicleQty: number;
  billingMode: BillingMode;
  timeUnit: TimeUnit;
  durationHours: number;
  durationDays: number;
  plannedUnits: number;
  includedKmTotal: number;
  estimatedKm: number;
  lines: QuoteLine[];
  rentalFee: number;
  chauffeurFee: number;
  surchargeFee: number;
  discountAmount: number;
  totalFee: number;
  overtimeEstimate: number;
  mileageOverageEstimate: number;
  pricingRuleId: string;
  pricingRuleName: string;
};

const TYPE_COEFF: Record<string, number> = {
  ECONOMY: 1,
  SEDAN: 1.05,
  SUV: 1.3,
  MPV: 1.4,
  NEW_ENERGY: 1.05,
  LUXURY: 1.6
};

const QTY_DISCOUNT = (n: number) => {
  if (n >= 11) return 0.88;
  if (n >= 6) return 0.9;
  if (n >= 2) return 0.95;
  return 1;
};

export const calcQuote = (
  vehicle: Vehicle,
  rule: PricingRule,
  req: QuoteRequest,
  stores: { id: string; city: string }[]
): OrderQuote => {
  const qty = Math.max(1, Math.min(20, req.vehicleQty ?? 1));
  const billingMode = req.billingMode ?? (rule.billingMode as BillingMode);
  const timeUnit = req.timeUnit ?? (rule.timeUnit as TimeUnit);
  const pickup = new Date(req.pickupTime);
  const ret = new Date(req.returnTime);
  const ms = Math.max(0, ret.getTime() - pickup.getTime());
  const durationHours = Math.ceil(ms / 3600000);
  const durationDays = Math.max(1, Math.ceil(ms / 86400000));
  const coeff = TYPE_COEFF[vehicle.vehicleTypeId] ?? 1.1;

  let plannedUnits = durationDays;
  if (timeUnit === "HOUR") plannedUnits = Math.max(4, durationHours);
  if (timeUnit === "WEEK") plannedUnits = Math.max(1, Math.ceil(durationDays / 7));
  if (timeUnit === "MONTH") plannedUnits = Math.max(1, Math.ceil(durationDays / 30));

  const unitPrice = vehicle.dailyPrice * coeff;
  let rentalFee = 0;
  const lines: QuoteLine[] = [];

  if (billingMode === "TIME") {
    const perUnit = timeUnit === "HOUR" ? unitPrice / 8 : unitPrice;
    rentalFee = perUnit * plannedUnits * qty;
    lines.push({
      feeType: "RENTAL",
      label: `租金（${timeUnit === "HOUR" ? "按小时" : "按天"}×${plannedUnits}${timeUnit === "HOUR" ? "小时" : "天"}×${qty}台）`,
      amount: rentalFee
    });
  } else if (billingMode === "MILEAGE") {
    const km = req.estimatedKm ?? rule.includedKm * plannedUnits;
    rentalFee = km * (rule.overKmPrice * 0.8) * qty;
    lines.push({ feeType: "RENTAL", label: `里程租金（预估${km}km）`, amount: rentalFee });
  } else {
    rentalFee = unitPrice * durationDays * qty;
    lines.push({
      feeType: "RENTAL",
      label: `日租（${durationDays}天×${qty}台，含${rule.includedKm}km/天）`,
      amount: rentalFee
    });
  }

  const includedKmTotal = rule.includedKm * durationDays * qty;
  const estimatedKm = req.estimatedKm ?? includedKmTotal;
  let mileageOverageEstimate = 0;
  if (billingMode === "HYBRID" && estimatedKm > includedKmTotal) {
    mileageOverageEstimate = (estimatedKm - includedKmTotal) * rule.overKmPrice;
    lines.push({
      feeType: "MILEAGE_OVERAGE",
      label: "预估超公里费",
      amount: mileageOverageEstimate,
      remark: `超出 ${estimatedKm - includedKmTotal} km × ¥${rule.overKmPrice}/km`
    });
  }

  let chauffeurFee = 0;
  if (req.serviceMode === "WITH_DRIVER" || req.serviceMode === "MIXED") {
    const mixedFactor = req.serviceMode === "MIXED" ? 0.45 : 1;
    const driverDaily = 200 + unitPrice * 0.35;
    chauffeurFee = Math.round(driverDaily * durationDays * qty * mixedFactor);
    lines.push({
      feeType: "CHAUFFEUR_BASE",
      label:
        req.serviceMode === "MIXED"
          ? `司机服务费（部分时段·${durationDays}天）`
          : `司机服务费（${durationDays}天）`,
      amount: chauffeurFee,
      remark: req.serviceMode === "MIXED" ? "按约 45% 全包司机费计（演示）" : undefined
    });
    const overtimeH = Math.max(0, durationHours - 8 * durationDays);
    if (overtimeH > 0) {
      const chauffeurOt = Math.round(overtimeH * 35 * qty * mixedFactor);
      chauffeurFee += chauffeurOt;
      lines.push({
        feeType: "CHAUFFEUR_OVERTIME",
        label: "司机超时（预估）",
        amount: chauffeurOt,
        remark: `超出含时 ${overtimeH} 小时`
      });
    }
  }

  let surchargeFee = 0;
  const pickupStore = stores.find((s) => s.id === req.pickupStoreId);
  const returnStore = stores.find((s) => s.id === req.returnStoreId);
  if (req.pickupStoreId !== req.returnStoreId) {
    const cross = pickupStore?.city === returnStore?.city ? 80 : 200;
    surchargeFee += cross * qty;
    lines.push({
      feeType: "CROSS_STORE",
      label: pickupStore?.city === returnStore?.city ? "异店还车" : "异地还车",
      amount: cross * qty
    });
  }

  const hour = pickup.getHours();
  if (hour >= 22 || hour < 7) {
    const night = 50 * qty;
    surchargeFee += night;
    lines.push({ feeType: "NIGHT_PICKUP", label: "夜间取车", amount: night });
  }

  const overtimeEstimate =
    billingMode !== "MILEAGE"
      ? Math.round(unitPrice * 0.35 * Math.max(0, durationHours - (timeUnit === "HOUR" ? plannedUnits : durationDays * 24)))
      : 0;
  if (overtimeEstimate > 0) {
    lines.push({
      feeType: "OVERTIME",
      label: "超时租金（预估）",
      amount: overtimeEstimate,
      remark: "还车晚于约定时按规则加收"
    });
  }

  const subtotal = rentalFee + chauffeurFee + surchargeFee + mileageOverageEstimate;
  const qtyDisc = QTY_DISCOUNT(qty);
  let discountAmount = 0;
  if (qtyDisc < 1) {
    discountAmount = Math.round(subtotal * (1 - qtyDisc));
    lines.push({
      feeType: "QTY_DISCOUNT",
      label: `车队批量折扣（${qty}台）`,
      amount: -discountAmount
    });
  }
  if (req.couponCode === "NEWUSER100" && subtotal >= 500) {
    const cpn = 100;
    discountAmount += cpn;
    lines.push({ feeType: "COUPON", label: "优惠券 NEWUSER100", amount: -cpn });
  }

  const totalFee = Math.max(0, subtotal + overtimeEstimate - discountAmount);

  return {
    quoteId: `quote-${Date.now()}`,
    validUntil: new Date(Date.now() + 15 * 60000).toISOString(),
    vehicleId: vehicle.id,
    plateNumber: vehicle.plateNumber,
    brand: vehicle.brand,
    model: vehicle.model,
    vehicleQty: qty,
    billingMode,
    timeUnit,
    durationHours,
    durationDays,
    plannedUnits,
    includedKmTotal,
    estimatedKm,
    lines,
    rentalFee,
    chauffeurFee,
    surchargeFee,
    discountAmount,
    totalFee,
    overtimeEstimate,
    mileageOverageEstimate,
    pricingRuleId: rule.id,
    pricingRuleName: rule.name
  };
};
