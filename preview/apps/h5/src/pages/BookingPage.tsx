import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  api,
  clearVehicleCart,
  formatMoney,
  getPreviewUserId,
  IDS,
  pickVehicleForBooking,
  readVehicleCart,
  formatHandoverDisplay,
  isoToLocalInputValue,
  SERVICE_MODE_META,
  settlementModeLabel,
  serviceModeLabel,
  vehicleTypeLabel,
  type BillingMode,
  type CreateOrderRequest,
  type Driver,
  type EligibilitySnapshot,
  type Order,
  type OrderQuote,
  type PageResult,
  type PerVehicleServiceMode,
  type QuoteRequest,
  type ServiceMode,
  type Store,
  type TimeUnit,
  type Vehicle
} from "@rental-preview/shared";
import { useCartLicenseEligibility } from "../hooks/useCartLicenseEligibility";
import { useAccountContext } from "../hooks/useAccountContext";
import { AccountAuthBanner } from "../components/AccountAuthBanner";
import { useOrderAgreement } from "../hooks/useOrderAgreement";
import { useVehicleCart } from "../hooks/useVehicleCart";
import { OrderAgreementPanel } from "../components/OrderAgreementPanel";
import { CartSelfDriveLicensePanel } from "../components/CartSelfDriveLicensePanel";
import { DetailLinkButton } from "../components/DetailLinkButton";
import { HandoverScheduleSection } from "../components/HandoverScheduleSection";
import { OptionChips } from "../components/OptionChips";
import { ServiceModeCards } from "../components/ServiceModeCards";
import { VehicleImage } from "../components/VehicleImage";
import { VehicleServiceModeChips } from "../components/VehicleServiceModeChips";
import { SectionCard } from "../components/SectionCard";
import { addDaysFromLocal, addDaysLocal, fromLocalInputValue } from "../lib/datetime";
import { cn } from "../lib/utils";

const BILLING_OPTIONS: { value: BillingMode; label: string; desc: string }[] = [
  { value: "HYBRID", label: "日租+里程", desc: "含公里·超公里另计" },
  { value: "TIME", label: "按时间", desc: "按天/小时计费" },
  { value: "MILEAGE", label: "按里程", desc: "按预估公里" }
];

const TIME_UNIT_OPTIONS: { value: TimeUnit; label: string }[] = [
  { value: "DAY", label: "按天" },
  { value: "HOUR", label: "按小时" },
  { value: "WEEK", label: "按周" }
];

export function BookingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const userId = getPreviewUserId();
  const { account, canRent, isEnterprise } = useAccountContext();

  const vehicleIdParam = params.get("vehicleId") ?? "";
  const vehicleTypeIdParam = params.get("vehicleTypeId") ?? "";
  const brandParam = params.get("brand") ?? "";
  const modelParam = params.get("model") ?? "";
  const cityParam = params.get("city") ?? "";
  const cartMode = params.get("cart") === "1";
  const reorderHint = params.get("reorder") === "1";
  const serviceModeParam = params.get("serviceMode");
  const settlementModeParam = params.get("settlementMode");
  const pickupStoreIdParam = params.get("pickupStoreId");
  const returnStoreIdParam = params.get("returnStoreId");
  const pickupTimeParam = params.get("pickupTime");
  const returnTimeParam = params.get("returnTime");

  const cartHook = useVehicleCart();

  const getCartLineMode = useCallback(
    (vehicleId: string): PerVehicleServiceMode =>
      cartHook.items.find((i) => i.vehicleId === vehicleId)?.serviceMode ?? "SELF_DRIVE",
    [cartHook.items]
  );

  const cartHasSelfDrive = useMemo(
    () => cartHook.items.some((i) => i.serviceMode === "SELF_DRIVE"),
    [cartHook.items]
  );
  const cartHasWithDriver = useMemo(
    () => cartHook.items.some((i) => i.serviceMode === "WITH_DRIVER"),
    [cartHook.items]
  );
  const cartIsMixed = cartHook.modeCounts.isMixed;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [cartVehicles, setCartVehicles] = useState<Vehicle[]>([]);
  const [cartQuotes, setCartQuotes] = useState<{ vehicleId: string; quote: OrderQuote }[]>([]);
  const [variantOptions, setVariantOptions] = useState<Vehicle[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [vehicleQty, setVehicleQty] = useState(1);
  const [pickupTime, setPickupTime] = useState(() =>
    pickupTimeParam ? isoToLocalInputValue(pickupTimeParam, 1) : addDaysLocal(1)
  );
  const [returnTime, setReturnTime] = useState(() =>
    returnTimeParam ? isoToLocalInputValue(returnTimeParam, 3) : addDaysLocal(3)
  );
  const [pickupStoreId, setPickupStoreId] = useState<string>(pickupStoreIdParam || IDS.storeSh);
  const [returnStoreId, setReturnStoreId] = useState<string>(returnStoreIdParam || IDS.storeSh);
  const [billingMode, setBillingMode] = useState<BillingMode>("HYBRID");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("DAY");
  const [serviceMode, setServiceMode] = useState<ServiceMode>(() => {
    if (
      serviceModeParam === "WITH_DRIVER" ||
      serviceModeParam === "SELF_DRIVE" ||
      serviceModeParam === "MIXED"
    ) {
      return serviceModeParam;
    }
    return "SELF_DRIVE";
  });

  const eligibilityMode: ServiceMode = cartMode
    ? cartIsMixed
      ? "MIXED"
      : cartHasSelfDrive
        ? "SELF_DRIVE"
        : "WITH_DRIVER"
    : serviceMode;
  const needsDriverPreview = cartMode
    ? cartHasWithDriver
    : serviceMode === "WITH_DRIVER" || serviceMode === "MIXED";

  const [settlementMode, setSettlementMode] = useState<"PREPAID" | "POSTPAID">(() => {
    if (settlementModeParam === "PREPAID" || settlementModeParam === "POSTPAID") {
      return settlementModeParam;
    }
    return isEnterprise ? "POSTPAID" : "PREPAID";
  });
  const [estimatedKm, setEstimatedKm] = useState(400);
  const [couponCode, setCouponCode] = useState("");
  const [sameStoreReturn, setSameStoreReturn] = useState(true);

  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilitySnapshot | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);

  const cartLicense = useCartLicenseEligibility(cartVehicles, getCartLineMode);
  const orderAgreement = useOrderAgreement();
  const [agreementChecked, setAgreementChecked] = useState(() => orderAgreement.accepted);

  const selfDriveEligibility =
    cartMode && cartHasSelfDrive
      ? cartLicense.needsMultiLicense
        ? cartLicense.eligibility
        : eligibility
      : eligibility;

  const selfDriveEligible = cartMode
    ? !cartHasSelfDrive || cartLicense.allSelfDriveLicensed
    : (eligibility?.eligible ?? true);

  useEffect(() => {
    void (async () => {
      const [s] = await Promise.all([api.get<Store[]>("/api/v1/admin/stores")]);

      if (s.ok && s.data) {
        setStores(s.data);
        if (s.data.length && !pickupStoreIdParam) {
          const byCity = cityParam ? s.data.find((x) => x.city === cityParam) : undefined;
          const fallback = byCity ?? s.data[0];
          setPickupStoreId(fallback.id);
          setReturnStoreId(fallback.id);
        }
      }

      if (cartMode) {
        const snap = readVehicleCart();
        if (!snap.items.length) {
          setCartVehicles([]);
          setVehicle(null);
          return;
        }
        const loaded = await Promise.all(
          snap.items.map((item) => api.get<Vehicle>(`/api/v1/vehicles/${item.vehicleId}`))
        );
        const list = loaded.filter((r) => r.ok && r.data).map((r) => r.data as Vehicle);
        setCartVehicles(list);
        const first = list[0] ?? null;
        setVehicle(first);
        setVariantOptions([]);
        if (first?.storeId) {
          setPickupStoreId(first.storeId);
          setReturnStoreId(first.storeId);
        }
        return;
      }

      const qs = new URLSearchParams({ status: "AVAILABLE", pageSize: "300" });
      if (vehicleTypeIdParam) qs.set("vehicleTypeId", vehicleTypeIdParam);
      const fleetRes = await api.get<PageResult<Vehicle>>(`/api/v1/vehicles?${qs}`);

      let list = fleetRes.ok && fleetRes.data ? fleetRes.data.items : [];
      if (brandParam) list = list.filter((v) => v.brand === brandParam);
      if (modelParam) list = list.filter((v) => v.model === modelParam);
      list = list.sort((a, b) => a.dailyPrice - b.dailyPrice);
      setVariantOptions(list);
      setCartVehicles([]);

      const picked =
        pickVehicleForBooking(list.length ? list : [], {
          vehicleId: vehicleIdParam || undefined,
          vehicleTypeId: vehicleTypeIdParam || undefined,
          brand: brandParam || undefined,
          model: modelParam || undefined,
          city: cityParam
        }) ??
        (vehicleIdParam
          ? (await api.get<Vehicle>(`/api/v1/vehicles/${vehicleIdParam}`)).data ?? null
          : null);

      setVehicle(picked);
      if (picked?.storeId) {
        setPickupStoreId(picked.storeId);
        setReturnStoreId(picked.storeId);
      }
    })();
  }, [vehicleIdParam, vehicleTypeIdParam, brandParam, modelParam, cityParam, cartMode]);

  useEffect(() => {
    if (pickupStoreIdParam) return;
    const target = vehicle ?? cartVehicles[0];
    if (!target || !stores.length) return;
    if (target.storeId) {
      setPickupStoreId(target.storeId);
      setReturnStoreId(target.storeId);
      return;
    }
    const st = stores.find((s) => s.city === target.city);
    if (st) {
      setPickupStoreId(st.id);
      setReturnStoreId(st.id);
    }
  }, [vehicle, cartVehicles, stores, pickupStoreIdParam]);

  useEffect(() => {
    const pick = new Date(pickupTime);
    const ret = new Date(returnTime);
    if (!Number.isNaN(pick.getTime()) && !Number.isNaN(ret.getTime()) && ret <= pick) {
      setReturnTime(addDaysFromLocal(pickupTime, 1));
    }
  }, [pickupTime]);

  const handleSelectVariant = (v: Vehicle) => {
    setVehicle(v);
    const next = new URLSearchParams(params);
    next.set("vehicleId", v.id);
    next.set("vehicleTypeId", v.vehicleTypeId);
    next.set("brand", v.brand);
    next.set("model", v.model);
    next.set("city", v.city);
    navigate(`/booking?${next}`, { replace: true });
  };

  useEffect(() => {
    if (!userId) {
      setEligibility(null);
      return;
    }
    if (cartMode && cartHasSelfDrive && cartLicense.needsMultiLicense) return;
    void api
      .get<EligibilitySnapshot>(`/api/v1/users/${userId}/eligibility?serviceMode=${eligibilityMode}`)
      .then((res) => {
        if (res.ok && res.data) setEligibility(res.data);
      });
  }, [userId, eligibilityMode, cartMode, cartHasSelfDrive, cartLicense.needsMultiLicense]);

  useEffect(() => {
    if (!needsDriverPreview) {
      setAssignedDriver(null);
      return;
    }
    void api
      .get<PageResult<Driver>>(
        `/api/v1/drivers?city=${encodeURIComponent(vehicle?.city ?? cartVehicles[0]?.city ?? cityParam ?? "上海")}&pageSize=10`
      )
      .then((res) => {
        if (res.ok && res.data?.items.length) {
          const preferred =
            res.data.items.find((d) => d.status === "AVAILABLE") ?? res.data.items[0];
          setAssignedDriver(preferred);
        }
      });
  }, [needsDriverPreview, cityParam, vehicle?.city, cartVehicles]);

  useEffect(() => {
    if (sameStoreReturn) setReturnStoreId(pickupStoreId);
  }, [sameStoreReturn, pickupStoreId]);

  const quoteBaseCommon = useMemo(
    () => ({
      pickupStoreId,
      returnStoreId,
      pickupTime: fromLocalInputValue(pickupTime),
      returnTime: fromLocalInputValue(returnTime),
      billingMode,
      timeUnit,
      estimatedKm,
      couponCode: couponCode.trim() || undefined,
      accountType: (account?.segment ?? "C") as "C" | "B" | "G"
    }),
    [
      pickupStoreId,
      returnStoreId,
      pickupTime,
      returnTime,
      billingMode,
      timeUnit,
      estimatedKm,
      couponCode,
      isEnterprise,
      userId
    ]
  );

  const quotePayload = useMemo((): QuoteRequest | null => {
    if (cartMode || !vehicle) return null;
    return {
      vehicleId: vehicle.id,
      vehicleQty,
      serviceMode,
      ...quoteBaseCommon
    };
  }, [cartMode, vehicle, vehicleQty, serviceMode, quoteBaseCommon]);

  const fetchQuote = useCallback(async () => {
    if (!quotePayload) return;
    setQuoteLoading(true);
    const res = await api.post<OrderQuote>("/api/v1/orders/quote", quotePayload);
    setQuoteLoading(false);
    if (res.ok && res.data) {
      setQuote(res.data);
      setMsg("");
    } else if (serviceMode === "SELF_DRIVE" || serviceMode === "MIXED") {
      setQuote(null);
      setMsg(res.error ?? "用车资格未通过，请完成驾照认证");
    }
  }, [quotePayload, serviceMode]);

  useEffect(() => {
    if (!cartMode) {
      const t = setTimeout(() => void fetchQuote(), 320);
      return () => clearTimeout(t);
    }
    if (!cartVehicles.length) {
      setCartQuotes([]);
      return;
    }
    const t = setTimeout(() => {
      void (async () => {
        setQuoteLoading(true);
        const results: { vehicleId: string; quote: OrderQuote }[] = [];
        for (const v of cartVehicles) {
          const lineMode = getCartLineMode(v.id);
          const res = await api.post<OrderQuote>("/api/v1/orders/quote", {
            vehicleId: v.id,
            vehicleQty: 1,
            serviceMode: lineMode,
            ...quoteBaseCommon
          });
          if (res.ok && res.data) results.push({ vehicleId: v.id, quote: res.data });
        }
        setCartQuotes(results);
        setQuoteLoading(false);
        const failedSelfDrive = cartVehicles.some(
          (v) =>
            getCartLineMode(v.id) === "SELF_DRIVE" &&
            !results.some((r) => r.vehicleId === v.id)
        );
        if (failedSelfDrive) {
          setMsg("部分自驾车辆报价失败，请完成驾照认证或改为包车");
        } else if (results.length < cartVehicles.length) {
          setMsg("部分车辆报价失败，请稍后重试或移除车辆");
        } else {
          setMsg("");
        }
      })();
    }, 320);
    return () => clearTimeout(t);
  }, [cartMode, cartVehicles, quoteBaseCommon, cartHook.items, getCartLineMode, fetchQuote]);

  const cartTotalFee = useMemo(
    () => cartQuotes.reduce((s, x) => s + x.quote.totalFee, 0),
    [cartQuotes]
  );

  const handleQtyChange = (delta: number) => {
    setVehicleQty((q) => Math.max(1, Math.min(20, q + delta)));
  };

  const buildOrderBody = (
    v: Vehicle,
    qty: number,
    quoteId?: string,
    lineServiceMode?: PerVehicleServiceMode
  ): CreateOrderRequest => {
    const sm = lineServiceMode ?? serviceMode;
    const needsDriver = lineServiceMode
      ? lineServiceMode === "WITH_DRIVER"
      : sm === "WITH_DRIVER" || sm === "MIXED";
    return {
      vehicleId: v.id,
      vehicleTypeId: v.vehicleTypeId,
      brand: v.brand,
      model: v.model,
      city: v.city,
      vehicleQty: qty,
      pickupStoreId,
      returnStoreId,
      pickupTime: quoteBaseCommon.pickupTime,
      returnTime: quoteBaseCommon.returnTime,
      settlementMode,
      serviceMode: sm,
      billingMode,
      timeUnit,
      estimatedKm,
      couponCode: couponCode.trim() || undefined,
      quoteId,
      billingAccountId: isEnterprise ? account?.org?.id : undefined,
      driverId: needsDriver ? (assignedDriver?.id ?? IDS.driver1) : undefined
    };
  };

  const handleSubmit = async () => {
    if (!agreementChecked) {
      setMsg("请先阅读并勾选同意订单前必读协议");
      return;
    }
    if (cartMode && cartHasSelfDrive && !selfDriveEligible) {
      setMsg(selfDriveEligibility?.message ?? "请为各台自驾车辆登记司机驾照");
      return;
    }
    if (!cartMode && eligibility && !eligibility.eligible) {
      setMsg(eligibility.message);
      return;
    }

    if (cartMode) {
      if (!cartVehicles.length) {
        setMsg("租车篮为空，请返回首页选车");
        return;
      }
      if (cartQuotes.length !== cartVehicles.length) {
        setMsg("请等待全部车辆报价完成");
        return;
      }
      setSubmitting(true);
      const created: string[] = [];
      for (const v of cartVehicles) {
        const line = cartQuotes.find((x) => x.vehicleId === v.id);
        const res = await api.post<Order>(
          "/api/v1/orders",
          buildOrderBody(v, 1, line?.quote.quoteId, getCartLineMode(v.id))
        );
        if (!res.ok || !res.data) {
          setSubmitting(false);
          setMsg(res.error ?? `${v.plateNumber} 下单失败`);
          return;
        }
        if (settlementMode === "PREPAID") {
          await api.post("/api/v1/payments", {
            orderId: res.data.id,
            amount: res.data.totalFee,
            channel: "wechat",
            settlementMode: "PREPAID"
          });
        }
        created.push(res.data.orderNo);
      }
      clearVehicleCart();
      cartHook.sync();
      setSubmitting(false);
      setMsg(`已创建 ${created.length} 笔订单：${created.join("、")}`);
      setTimeout(() => navigate("/orders"), 800);
      return;
    }

    if (!vehicle || !quotePayload) return;
    setSubmitting(true);
    const res = await api.post<Order>("/api/v1/orders", buildOrderBody(vehicle, vehicleQty, quote?.quoteId));
    if (!res.ok || !res.data) {
      setSubmitting(false);
      setMsg(res.error ?? "下单失败");
      return;
    }
    if (settlementMode === "PREPAID") {
      await api.post("/api/v1/payments", {
        orderId: res.data.id,
        amount: res.data.totalFee,
        channel: "wechat",
        settlementMode: "PREPAID"
      });
    }
    setSubmitting(false);
    setMsg("订单已创建：" + res.data.orderNo);
    setTimeout(() => navigate(`/orders/${res.data!.id}`), 600);
  };

  const preferredCity = vehicle?.city ?? cartVehicles[0]?.city ?? cityParam;

  const pickupStoreOptions = useMemo(() => {
    if (!preferredCity) return stores;
    const matched = stores.filter((s) => s.city === preferredCity);
    return matched.length ? matched : stores;
  }, [stores, preferredCity]);

  const pickupStore = stores.find((s) => s.id === pickupStoreId);
  const returnStore = stores.find((s) => s.id === returnStoreId);

  const durationPreview = quote ?? cartQuotes[0]?.quote;

  const validUntil = quote?.validUntil
    ? new Date(quote.validUntil).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="space-y-4 p-4 pb-44">
      <button
        type="button"
        className="text-sm text-primary"
        onClick={() => navigate("/")}
      >
        ← 返回首页选车
      </button>

      <div>
        <h2 className="text-lg font-bold">{cartMode ? "租车篮结算" : "填写租车需求"}</h2>
        <p className="text-xs text-muted-foreground">
          {cartMode
            ? `共 ${cartVehicles.length} 台车，将分别生成订单（演示批量下单）`
            : "自驾须司机/本人驾照 · 包车无需客户驾照"}
        </p>
        {reorderHint && !cartMode && (
          <p className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
            已根据上一单预填车辆、交车时间与地点，请确认后下单
          </p>
        )}
      </div>

      {account && <AccountAuthBanner account={account} />}

      <HandoverScheduleSection
        pickupTime={pickupTime}
        returnTime={returnTime}
        onPickupTimeChange={setPickupTime}
        onReturnTimeChange={setReturnTime}
        pickupStoreId={pickupStoreId}
        returnStoreId={returnStoreId}
        onPickupStoreChange={setPickupStoreId}
        onReturnStoreChange={setReturnStoreId}
        pickupStoreOptions={pickupStoreOptions}
        returnStoreOptions={stores}
        sameStoreReturn={sameStoreReturn}
        onSameStoreReturnChange={setSameStoreReturn}
        durationDays={durationPreview?.durationDays}
        durationHours={durationPreview?.durationHours}
      />

      {cartMode && cartVehicles.length === 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
          <p className="font-medium text-warning">租车篮为空</p>
          <button type="button" className="mt-2 text-primary underline" onClick={() => navigate("/home")}>
            返回首页勾选车辆
          </button>
        </div>
      )}

      {cartMode && cartVehicles.length > 0 && (
        <SectionCard title="租车篮" description="每台车单独一单；每台可单独选自驾或包车">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              自驾 {cartHook.modeCounts.selfDrive} · 包车 {cartHook.modeCounts.withDriver}
            </span>
            <button
              type="button"
              className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground"
              onClick={() => cartHook.setAllWithDriver()}
            >
              全部包司机
            </button>
            <button
              type="button"
              className="rounded-full border border-border px-3 py-1 text-muted-foreground"
              onClick={() => cartHook.setAllSelfDrive()}
            >
              全部自驾
            </button>
          </div>
          <ul className="space-y-2">
            {cartVehicles.map((v) => {
              const line = cartQuotes.find((x) => x.vehicleId === v.id);
              const lineMode = getCartLineMode(v.id);
              return (
                <li
                  key={v.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <VehicleImage
                      src={v.imageUrl}
                      vehicleId={v.id}
                      vehicleTypeId={v.vehicleTypeId}
                      className="h-12 w-16 rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {v.brand} {v.model} · {v.plateNumber}
                        </p>
                        <DetailLinkButton to={`/vehicles/${v.id}?from=booking`} label="详情" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {serviceModeLabel[lineMode]} ·{" "}
                        {line ? formatMoney(line.quote.totalFee) : quoteLoading ? "试算中…" : "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-muted-foreground"
                      onClick={() => {
                        cartHook.remove(v.id);
                        setCartVehicles((prev) => prev.filter((x) => x.id !== v.id));
                      }}
                    >
                      移除
                    </button>
                  </div>
                  <VehicleServiceModeChips
                    value={lineMode}
                    onChange={(mode) => cartHook.setItemServiceMode(v.id, mode)}
                    compact
                  />
                </li>
              );
            })}
          </ul>
          {cartQuotes.length > 0 && (
            <p className="text-right text-sm font-bold text-primary">
              合计预估 {formatMoney(cartTotalFee)}
            </p>
          )}
        </SectionCard>
      )}

      {cartMode ? (
        <SectionCard title="服务类型" description="已在租车篮按车设定，可在此或返回首页调整">
          {cartIsMixed ? (
            <p className="rounded-lg bg-warning/10 px-3 py-2 text-sm font-medium text-warning">
              部分带司机+自驾：{cartHook.modeCounts.selfDrive} 台自驾 +{" "}
              {cartHook.modeCounts.withDriver} 台包车（将分别下单）
            </p>
          ) : (
            <p className="text-sm">
              篮内{" "}
              <strong>
                {cartHook.modeCounts.withDriver > 0 ? "包车带司机" : "自驾"}
              </strong>{" "}
              × {cartHook.items.length} 台
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            每台车仅选自驾或包车；含自驾须登记本次自驾司机驾照（多台各一名）。
          </p>
        </SectionCard>
      ) : (
        <SectionCard
          title="服务类型"
          description="自驾 / 包车带司机 / 部分带司机+自驾（分时段或车队组合）"
        >
          <ServiceModeCards
            value={serviceMode}
            onChange={(mode) => {
              setServiceMode(mode);
              setMsg("");
            }}
          />
          <p className="text-xs text-muted-foreground">
            {SERVICE_MODE_META[serviceMode].bullets.join("；")}
          </p>
        </SectionCard>
      )}

      {cartMode && cartHasSelfDrive && (
        <CartSelfDriveLicensePanel
          vehicles={cartLicense.selfDriveOnly}
          eligibility={selfDriveEligibility}
          loading={cartLicense.loading}
        />
      )}

      {!cartMode &&
        (serviceMode === "SELF_DRIVE" || serviceMode === "MIXED") &&
        eligibility &&
        !eligibility.eligible && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
          <p className="font-medium">
            {serviceMode === "MIXED"
              ? "部分带司机+自驾须完成司机/本人驾照（含自驾段）"
              : "单台自驾可用本人驾照；请完成实名与驾照认证"}
          </p>
          <p className="mt-1 text-xs">{eligibility.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {eligibility.realnameStatus !== "APPROVED" && (
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-xs"
                onClick={() => navigate("/realname?from=booking")}
              >
                去实名认证
              </button>
            )}
            <button
              type="button"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground"
              onClick={() => navigate("/license?from=booking")}
            >
              本人驾照认证
            </button>
          </div>
        </div>
      )}

      {cartMode &&
        cartHasSelfDrive &&
        selfDriveEligibility &&
        !selfDriveEligibility.eligible &&
        selfDriveEligibility.realnameStatus !== "APPROVED" && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
          <p className="font-medium">请先完成实名认证</p>
          <button
            type="button"
            className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground"
            onClick={() => navigate("/realname?from=booking")}
          >
            去实名认证
          </button>
        </div>
      )}

      {(cartMode ? cartHasWithDriver : serviceMode === "WITH_DRIVER" || serviceMode === "MIXED") && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
          <p className="font-medium text-primary">
            {serviceMode === "MIXED" && !cartMode
              ? "部分带司机+自驾 · 含司机服务时段"
              : "包车带司机 · 无需上传您的驾驶证"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {cartMode && cartIsMixed
              ? "包车订单将指派司机；自驾订单须您本人持证取车。"
              : serviceMode === "MIXED"
                ? "演示按约 45% 司机服务费计；其余时段由客户自驾，须持有效驾照。"
                : "平台指派持证司机，报价含司机服务费；请确保实名信息准确以便联系。"}
          </p>
          {assignedDriver && (
            <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">
                  预计指派：{assignedDriver.name}（{assignedDriver.driverNo}）
                </p>
                <DetailLinkButton
                  to={`/drivers/${assignedDriver.id}?from=booking`}
                  label="司机详情"
                />
              </div>
              <p className="mt-1 text-muted-foreground">
                准驾 {assignedDriver.licenseType} · 评分 {assignedDriver.rating ?? "—"} · {assignedDriver.phone}
              </p>
            </div>
          )}
          {eligibility && !eligibility.eligible && eligibility.realnameStatus !== "APPROVED" && (
            <button
              type="button"
              className="mt-2 text-xs text-primary underline"
              onClick={() => navigate("/realname?from=booking")}
            >
              请先完成实名认证
            </button>
          )}
        </div>
      )}

      {(cartMode ? cartHasSelfDrive && selfDriveEligible : eligibility?.eligible) &&
        (cartMode || serviceMode === "SELF_DRIVE" || serviceMode === "MIXED") && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
          {cartLicense.needsMultiLicense && cartHasSelfDrive
            ? `自驾 ${cartLicense.selfDriveOnly.length} 台车司机驾照均已通过，可下单`
            : "实名与驾照已通过，可自驾下单"}
        </p>
      )}

      {!cartMode && vehicle ? (
        <>
          <div className="card-surface flex gap-3 p-3">
            <VehicleImage
              src={vehicle.imageUrl}
              vehicleId={vehicle.id}
              vehicleTypeId={vehicle.vehicleTypeId}
              className="h-16 w-24 rounded-lg"
            />
            <div className="min-w-0 flex-1 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">
                  {vehicle.brand} {vehicle.model}
                </p>
                <DetailLinkButton to={`/vehicles/${vehicle.id}?from=booking`} />
              </div>
              <p className="text-muted-foreground">
                {vehicleTypeLabel[vehicle.vehicleTypeId] ?? vehicle.vehicleTypeId} · {vehicle.plateNumber} ·{" "}
                {vehicle.city}
              </p>
              <p className="mt-1 text-primary">{formatMoney(vehicle.dailyPrice)}/天 基价</p>
            </div>
          </div>
          {variantOptions.length > 1 && (
            <SectionCard
              title="同车款可选车辆"
              description="多型号/多台同配置，切换后报价自动更新"
            >
              <div className="flex flex-wrap gap-2">
                {variantOptions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-xs",
                      vehicle.id === v.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card"
                    )}
                    onClick={() => handleSelectVariant(v)}
                  >
                    <span className="font-medium">{v.plateNumber}</span>
                    <span className="ml-1 text-muted-foreground">{formatMoney(v.dailyPrice)}/天</span>
                  </button>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      ) : !cartMode ? (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
          <p className="font-medium text-warning">请先在首页选择车型/车款</p>
          <button
            type="button"
            className="mt-2 text-primary underline"
            onClick={() => navigate("/")}
          >
            去首页选车
          </button>
        </div>
      ) : null}

      {!cartMode && (
      <SectionCard title="车队 / 车辆数量" description="多台同车型享批量折扣（2台95折、6台9折）">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-lg"
            onClick={() => handleQtyChange(-1)}
            aria-label="减少车辆"
          >
            −
          </button>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{vehicleQty}</p>
            <p className="text-xs text-muted-foreground">台（同车型）</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-lg"
            onClick={() => handleQtyChange(1)}
            aria-label="增加车辆"
          >
            +
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 5, 10].map((n) => (
            <button
              key={n}
              type="button"
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                vehicleQty === n ? "bg-primary/10 font-medium text-primary" : "bg-muted text-muted-foreground"
              )}
              onClick={() => setVehicleQty(n)}
            >
              {n} 台
            </button>
          ))}
        </div>
      </SectionCard>
      )}

      <SectionCard title="计费方式" description="对齐定价策略 TIME / HYBRID / MILEAGE">
        <OptionChips
          options={BILLING_OPTIONS.map((b) => ({ value: b.value, label: b.label }))}
          value={billingMode}
          onChange={(v) => setBillingMode(v as BillingMode)}
          columns={3}
        />
        {billingMode !== "MILEAGE" && (
          <>
            <p className="text-xs text-muted-foreground">时间单位</p>
            <OptionChips
              options={TIME_UNIT_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
              value={timeUnit}
              onChange={(v) => setTimeUnit(v as TimeUnit)}
              columns={3}
            />
          </>
        )}
        {(billingMode === "HYBRID" || billingMode === "MILEAGE") && (
          <label className="block text-xs text-muted-foreground">
            预估行驶里程（km）
            <input
              type="range"
              min={50}
              max={3000}
              step={50}
              value={estimatedKm}
              onChange={(e) => setEstimatedKm(Number(e.target.value))}
              className="mt-2 w-full"
            />
            <span className="font-medium text-foreground">{estimatedKm} km</span>
            {quote && billingMode === "HYBRID" && (
              <span className="ml-2 text-muted-foreground">（含公里 {quote.includedKmTotal} km）</span>
            )}
          </label>
        )}
      </SectionCard>

      <SectionCard title="结算方式">
        <p className="text-xs text-muted-foreground">
          当前：{serviceModeLabel[serviceMode]}
          {serviceMode === "WITH_DRIVER" ? "（含司机费）" : "（须司机/本人驾照）"}
        </p>
        <p className="text-xs text-muted-foreground">付款方式</p>
        <OptionChips
          options={[
            { value: "PREPAID", label: settlementModeLabel.PREPAID },
            { value: "POSTPAID", label: settlementModeLabel.POSTPAID, disabled: !isEnterprise }
          ]}
          value={settlementMode}
          onChange={(v) => setSettlementMode(v as typeof settlementMode)}
        />
        <label className="block text-xs text-muted-foreground">
          优惠券（演示：NEWUSER100 满500减100）
          <input
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm uppercase"
            placeholder="选填券码"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </label>
      </SectionCard>

      <SectionCard title="费用明细" description={`报价有效期至 ${validUntil}`}>
        {quoteLoading && <p className="text-sm text-muted-foreground">正在试算…</p>}
        {cartMode && !quoteLoading && cartQuotes.length > 0 && (
          <ul className="space-y-2 text-sm">
            {cartQuotes.map(({ vehicleId, quote: q }) => {
              const v = cartVehicles.find((x) => x.id === vehicleId);
              return (
                <li key={vehicleId} className="flex justify-between gap-2 border-b border-border pb-2">
                  <span className="text-muted-foreground truncate">
                    {v?.plateNumber} {v?.brand}
                  </span>
                  <span className="shrink-0 font-medium">{formatMoney(q.totalFee)}</span>
                </li>
              );
            })}
            <li className="flex justify-between pt-1 text-base font-bold">
              <span>合计预估</span>
              <span className="text-primary">{formatMoney(cartTotalFee)}</span>
            </li>
          </ul>
        )}
        {!cartMode && quote && !quoteLoading && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              规则：{quote.pricingRuleName} · {quote.billingMode} / {quote.timeUnit}
            </p>
            <ul className="space-y-1.5 text-sm">
              {quote.lines.map((line) => (
                <li key={line.feeType + line.label} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {line.label}
                    {line.remark && <span className="block text-[10px]">{line.remark}</span>}
                  </span>
                  <span className={cn("shrink-0 font-medium", line.amount < 0 && "text-success")}>
                    {line.amount < 0 ? "−" : ""}
                    {formatMoney(Math.abs(line.amount))}
                  </span>
                </li>
              ))}
            </ul>
            {(quote.overtimeEstimate > 0 || quote.mileageOverageEstimate > 0) && (
              <div className="rounded-lg border border-dashed border-warning/50 bg-warning/5 p-2 text-xs text-muted-foreground">
                <p className="font-medium text-warning">还车结算可能追加（演示预估）</p>
                {quote.overtimeEstimate > 0 && <p>· 超时租金约 {formatMoney(quote.overtimeEstimate)}</p>}
                {quote.mileageOverageEstimate > 0 && (
                  <p>· 超公里费约 {formatMoney(quote.mileageOverageEstimate)}（按实际里程）</p>
                )}
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>应付预估</span>
              <span className="text-primary">{formatMoney(quote.totalFee)}</span>
            </div>
          </div>
        )}
      </SectionCard>

      <OrderAgreementPanel
        checked={agreementChecked}
        onCheckedChange={setAgreementChecked}
        showCheckbox={false}
      />

      {msg && <p className="text-center text-sm text-primary">{msg}</p>}

      <div className="fixed bottom-0 left-0 right-0 z-30 bar-surface px-4 py-3 safe-bottom">
        {pickupStore && (
          <p className="mb-2 truncate text-center text-[10px] text-muted-foreground">
            交车 {formatHandoverDisplay(pickupTime)} · {pickupStore.city} {pickupStore.name}
            {!sameStoreReturn && returnStore && returnStore.id !== pickupStore.id
              ? ` → 还车 ${returnStore.city}`
              : ""}
          </p>
        )}
        <OrderAgreementPanel
          variant="compact"
          checked={agreementChecked}
          showSummary={false}
          onCheckedChange={(v) => {
            setAgreementChecked(v);
            if (v) orderAgreement.accept();
            else orderAgreement.clearAcceptance();
          }}
        />
        <button
          type="button"
          disabled={
            submitting ||
            quoteLoading ||
            !canRent ||
            !agreementChecked ||
            !selfDriveEligible ||
            (!cartMode && eligibility !== null && !eligibility.eligible) ||
            (cartMode
              ? cartVehicles.length === 0 || cartQuotes.length !== cartVehicles.length
              : !vehicle || !quote)
          }
          className="mt-2 w-full rounded-xl bg-primary py-3.5 font-medium text-primary-foreground disabled:opacity-50"
          onClick={() => void handleSubmit()}
        >
          {submitting
            ? "提交中…"
            : !canRent
              ? "请先完成账号认证"
              : !agreementChecked
              ? "请先阅读并同意协议"
              : !selfDriveEligible
              ? cartLicense.needsMultiLicense
                ? `请补充 ${cartLicense.selfDriveOnly.length} 名司机驾照`
                : "请先完成司机/本人驾照"
              : !cartMode && eligibility && !eligibility.eligible
                ? serviceMode === "SELF_DRIVE"
                  ? "请先完成驾照认证"
                  : "请先完成实名认证"
              : cartMode
                ? settlementMode === "PREPAID"
                  ? `支付 ${formatMoney(cartTotalFee)} · 提交 ${cartVehicles.length} 单`
                  : `提交 ${cartVehicles.length} 笔包车订单`
                : serviceMode === "WITH_DRIVER"
                  ? settlementMode === "PREPAID"
                    ? `包车下单 ${quote ? formatMoney(quote.totalFee) : ""}`
                    : "包车授信下单"
                  : settlementMode === "PREPAID"
                    ? `支付 ${quote ? formatMoney(quote.totalFee) : "—"} 并自驾下单`
                    : "自驾授信下单"}
        </button>
      </div>
    </div>
  );
}
