import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  api,
  buildVehicleModelOfferings,
  buildVehicleTypeSummaries,
  formatMoney,
  getPreviewUserId,
  pickRecentReorderableOrders,
  SERVICE_MODE_META,
  vehicleTypeLabel,
  VEHICLE_CART_MAX,
  type Order,
  type PageResult,
  type PerVehicleServiceMode,
  type Vehicle
} from "@rental-preview/shared";
import { AccountAuthBanner } from "../components/AccountAuthBanner";
import { HomeQuickActions } from "../components/HomeQuickActions";
import { VehicleCartBar } from "../components/VehicleCartBar";
import { useAccountContext } from "../hooks/useAccountContext";
import { VehicleImage } from "../components/VehicleImage";
import { DetailLinkButton } from "../components/DetailLinkButton";
import { VehicleSelectCheckbox } from "../components/VehicleSelectCheckbox";
import { VehicleServiceModeChips } from "../components/VehicleServiceModeChips";
import { useVehicleCart } from "../hooks/useVehicleCart";
import { cn } from "../lib/utils";

const TYPE_FILTERS = [
  { value: "", label: "全部车型" },
  ...Object.entries(vehicleTypeLabel).map(([value, label]) => ({ value, label }))
] as const;

const SORT_OPTIONS = [
  { value: "price_asc", label: "价格↑" },
  { value: "price_desc", label: "价格↓" }
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const cart = useVehicleCart();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("price_asc");
  const [view, setView] = useState<"models" | "fleet">("fleet");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [rowModes, setRowModes] = useState<Record<string, PerVehicleServiceMode>>({});
  const [defaultAddMode, setDefaultAddMode] = useState<PerVehicleServiceMode>("SELF_DRIVE");
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const userId = getPreviewUserId();
  const { account, canRent } = useAccountContext();

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const qs = new URLSearchParams({ status: "AVAILABLE", pageSize: "300" });
      const v = await api.get<PageResult<Vehicle>>(`/api/v1/vehicles?${qs}`);
      if (v.ok && v.data) setVehicles(v.data.items);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!userId) {
      setRecentOrders([]);
      return;
    }
    void api
      .get<PageResult<Order>>(`/api/v1/orders?userId=${userId}&pageSize=20`)
      .then((res) => {
        if (res.ok && res.data) {
          setRecentOrders(pickRecentReorderableOrders(res.data.items, 5));
        }
      });
  }, [userId]);

  const typeFiltered = useMemo(() => {
    if (!typeFilter) return vehicles;
    return vehicles.filter((v) => v.vehicleTypeId === typeFilter);
  }, [vehicles, typeFilter]);

  const typeSummaries = useMemo(() => buildVehicleTypeSummaries(vehicles), [vehicles]);

  const modelOfferings = useMemo(
    () => buildVehicleModelOfferings(typeFiltered, typeFilter || undefined),
    [typeFiltered, typeFilter]
  );

  const sortedModels = useMemo(() => {
    const list = [...modelOfferings];
    if (sort === "price_asc") list.sort((a, b) => a.minDailyPrice - b.minDailyPrice);
    if (sort === "price_desc") list.sort((a, b) => b.minDailyPrice - a.minDailyPrice);
    return list;
  }, [modelOfferings, sort]);

  const sortedFleet = useMemo(() => {
    const list = [...typeFiltered];
    if (sort === "price_asc") list.sort((a, b) => a.dailyPrice - b.dailyPrice);
    if (sort === "price_desc") list.sort((a, b) => b.dailyPrice - a.dailyPrice);
    return list;
  }, [typeFiltered, sort]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const getRowMode = (v: Vehicle): PerVehicleServiceMode =>
    cart.getItem(v.id)?.serviceMode ?? rowModes[v.id] ?? defaultAddMode;

  const handleSetRowMode = (v: Vehicle, mode: PerVehicleServiceMode) => {
    setRowModes((prev) => ({ ...prev, [v.id]: mode }));
    if (cart.has(v.id)) cart.setItemServiceMode(v.id, mode);
  };

  const handleToggleVehicle = (v: Vehicle) => {
    if (!canRent) {
      showToast(account?.message ?? "请先完成账号认证");
      return;
    }
    const res = cart.toggle(v, getRowMode(v));
    if (!res.ok) showToast(res.message);
  };

  const handleAllWithDriver = () => {
    cart.setAllWithDriver();
    setDefaultAddMode("WITH_DRIVER");
    setRowModes((prev) => {
      const next = { ...prev };
      sortedFleet.forEach((vf) => {
        next[vf.id] = "WITH_DRIVER";
      });
      sortedModels.forEach((o) => {
        const first = o.vehicles[0];
        if (first) next[first.id] = "WITH_DRIVER";
      });
      return next;
    });
  };

  const handleAllSelfDrive = () => {
    cart.setAllSelfDrive();
    setDefaultAddMode("SELF_DRIVE");
    setRowModes((prev) => {
      const next = { ...prev };
      sortedFleet.forEach((vf) => {
        next[vf.id] = "SELF_DRIVE";
      });
      return next;
    });
  };

  const handleSelectAllFleet = () => {
    if (!canRent) {
      showToast(account?.message ?? "请先完成账号认证");
      return;
    }
    const allSelected = sortedFleet.every((v) => cart.has(v.id));
    if (allSelected) {
      sortedFleet.forEach((v) => cart.remove(v.id));
      return;
    }
    let added = 0;
    for (const v of sortedFleet) {
      if (cart.has(v.id)) continue;
      if (cart.count >= VEHICLE_CART_MAX) {
        showToast(`最多选择 ${VEHICLE_CART_MAX} 台，已加入 ${added} 台`);
        break;
      }
      const res = cart.add(v, rowModes[v.id] ?? defaultAddMode);
      if (!res.ok) {
        showToast(res.message);
        break;
      }
      added += 1;
    }
  };

  const fleetAllSelected =
    sortedFleet.length > 0 && sortedFleet.every((v) => cart.has(v.id));
  const fleetSomeSelected = sortedFleet.some((v) => cart.has(v.id));

  return (
    <div className={cn("space-y-4 p-4", cart.count > 0 ? "pb-44" : "pb-6")}>
      <section className="card-surface border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground">多选车辆 · 租车篮合并结算（最多 {VEHICLE_CART_MAX} 台）</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">智慧租车</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {loading ? "加载可租车辆…" : `可租 ${vehicles.length} 台 · 租车篮 ${cart.count} 台`}
        </p>
      </section>

      {toast && (
        <p className="rounded-lg bg-warning/15 px-3 py-2 text-center text-xs text-warning">{toast}</p>
      )}

      <HomeQuickActions recentOrders={recentOrders} />

      {account && <AccountAuthBanner account={account} />}

      <div className="rounded-xl border border-border bg-card p-3 text-xs">
        <p className="font-medium text-foreground">用车方式说明</p>
        <p className="mt-1 text-muted-foreground">
          {account?.requiresOrgAuth ? (
            <>
              <strong className="text-foreground">B/G 端</strong>
              ：企业资质与成员账号认证通过后方可选车；自驾另须驾照，包车无需客户驾照。
            </>
          ) : (
            <>
              <strong className="text-foreground">C 端</strong>：
            </>
          )}{" "}
          <span className="text-warning">{SERVICE_MODE_META.SELF_DRIVE.title}</span>
          ：须实名 +{" "}
          <Link to="/license" className="text-primary underline">
            本人驾照认证
          </Link>
          ；多台自驾须在结算页登记<strong>本次自驾司机</strong>驾照
          ；<span className="text-primary">{SERVICE_MODE_META.WITH_DRIVER.title}</span>
          ：无需客户驾照；
          <span className="text-primary">{SERVICE_MODE_META.MIXED.title}</span>
          ：多车可混选自驾/包车，或下单页选「部分带司机+自驾」。
        </p>
      </div>

      {!loading && typeSummaries.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {typeSummaries.map((t) => (
            <button
              key={t.vehicleTypeId}
              type="button"
              className={cn(
                "shrink-0 rounded-xl border px-3 py-2 text-left text-xs",
                typeFilter === t.vehicleTypeId ? "chip-active" : "chip-idle"
              )}
              onClick={() => setTypeFilter(typeFilter === t.vehicleTypeId ? "" : t.vehicleTypeId)}
            >
              <p className="font-semibold">{t.label}</p>
              <p className="text-muted-foreground">
                {formatMoney(t.minDailyPrice)}起 · {t.modelCount}款
              </p>
            </button>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">车型分类</p>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.value || "all"}
              type="button"
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                typeFilter === t.value
                  ? "bg-primary/10 font-medium text-primary"
                  : "bg-muted text-muted-foreground"
              )}
              onClick={() => setTypeFilter(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex rounded-lg border border-border p-0.5">
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-1",
              view === "models" && "bg-primary/10 font-medium text-primary"
            )}
            onClick={() => setView("models")}
          >
            按车款选
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-1",
              view === "fleet" && "bg-primary/10 font-medium text-primary"
            )}
            onClick={() => setView("fleet")}
          >
            按车辆选
          </button>
        </div>
        <div className="flex items-center gap-2">
          {view === "fleet" && sortedFleet.length > 0 && (
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors",
                fleetSomeSelected
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "border-border text-muted-foreground"
              )}
              onClick={handleSelectAllFleet}
            >
              <span className="pointer-events-none">
                <VehicleSelectCheckbox
                  checked={fleetAllSelected}
                  indeterminate={fleetSomeSelected && !fleetAllSelected}
                  onChange={() => {}}
                  size="sm"
                  ariaLabel="全选本页"
                />
              </span>
              {fleetAllSelected ? "取消全选" : "全选本页"}
            </button>
          )}
          <div className="flex gap-1 text-muted-foreground">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={cn(
                  "rounded px-2 py-0.5",
                  sort === s.value && "bg-primary/10 text-primary font-medium"
                )}
                onClick={() => setSort(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        暂不按城市筛选 · 勾选车辆并选择自驾/包车，支持多台一并下单（取还门店在下单页按车辆所属城市选择）
      </p>

      {view === "fleet" && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs">
          <span className="text-muted-foreground">新加入默认：</span>
          <VehicleServiceModeChips value={defaultAddMode} onChange={setDefaultAddMode} compact />
          {cart.count > 0 && (
            <>
              <span className="text-border">|</span>
              <button
                type="button"
                className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary"
                onClick={handleAllWithDriver}
              >
                全部包司机
              </button>
              <button
                type="button"
                className="rounded-full border border-border px-3 py-1 text-muted-foreground"
                onClick={handleAllSelfDrive}
              >
                全部自驾
              </button>
              <span className="text-muted-foreground">
                {cart.modeCounts.isMixed
                  ? `混合 ${cart.modeCounts.selfDrive} 自驾 + ${cart.modeCounts.withDriver} 包车`
                  : `篮内 ${cart.modeCounts.withDriver} 台包车 / ${cart.modeCounts.selfDrive} 台自驾`}
              </span>
            </>
          )}
        </div>
      )}

      {view === "models" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedModels.map((o) => {
            const inCart = o.vehicles.some((v) => cart.has(v.id));
            return (
              <div
                key={o.key}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all",
                  inCart
                    ? "border-primary/50 bg-primary/5"
                    : "border-border"
                )}
              >
                <div className="relative">
                  <VehicleImage
                    src={o.imageUrl}
                    alt={o.title}
                    vehicleTypeId={o.vehicleTypeId}
                    vehicleId={o.vehicles[0]?.id}
                    className="h-32 w-full"
                  />
                  {inCart && <div className="pointer-events-none absolute inset-0 bg-primary/15" aria-hidden />}
                  <div className="absolute left-2 top-2">
                    <VehicleSelectCheckbox
                      checked={inCart}
                      ariaLabel={`将 ${o.title} 加入租车篮`}
                      onChange={() => {
                        const first = o.vehicles[0];
                        if (!first) return;
                        const mode =
                          cart.getItem(first.id)?.serviceMode ??
                          rowModes[first.id] ??
                          defaultAddMode;
                        const res = cart.toggle(first, mode);
                        if (!res.ok) showToast(res.message);
                      }}
                    />
                  </div>
                  {inCart && (
                    <span className="absolute right-2 top-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      已选
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight">{o.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {o.typeLabel}
                        {o.availableCount > 1 ? ` · ${o.availableCount} 台可租` : ""}
                      </p>
                      <p className="mt-2 text-primary font-bold">
                        {formatMoney(o.minDailyPrice)}
                        <span className="text-xs font-normal text-muted-foreground">/天起</span>
                      </p>
                      {o.vehicles[0] && (
                        <div className="mt-2">
                          <VehicleServiceModeChips
                            value={
                              cart.getItem(o.vehicles[0].id)?.serviceMode ??
                              rowModes[o.vehicles[0].id] ??
                              defaultAddMode
                            }
                            onChange={(mode) => handleSetRowMode(o.vehicles[0], mode)}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {o.vehicles[0] && (
                      <DetailLinkButton
                        to={`/vehicles/${o.vehicles[0].id}?from=home`}
                        className="flex-1"
                      />
                    )}
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-primary/40 py-1.5 text-xs text-primary"
                      onClick={() => {
                        const first = o.vehicles[0];
                        if (!first) return;
                        navigate(
                          `/booking?city=${encodeURIComponent(first.city)}&vehicleId=${first.id}&vehicleTypeId=${o.vehicleTypeId}&brand=${encodeURIComponent(o.brand)}&model=${encodeURIComponent(o.model)}`
                        );
                      }}
                    >
                      仅租此车款
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && sortedModels.length === 0 && (
            <p className="col-span-2 py-12 text-center text-sm text-muted-foreground">
              该车型暂无可租车辆，请切换筛选
            </p>
          )}
        </div>
      )}

      {view === "fleet" && (
        <div className="space-y-3">
          {sortedFleet.map((v) => {
            const inCart = cart.has(v.id);
            return (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                aria-pressed={inCart}
                aria-label={`${inCart ? "取消选择" : "选择"} ${v.brand} ${v.model} ${v.plateNumber}`}
                className={cn(
                  "flex gap-3 rounded-2xl border border-border bg-card p-3 transition-all active:scale-[0.99]",
                  inCart
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card"
                )}
                onClick={() => handleToggleVehicle(v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleVehicle(v);
                  }
                }}
              >
                <div className="relative shrink-0">
                  <VehicleImage
                    src={v.imageUrl}
                    vehicleId={v.id}
                    vehicleTypeId={v.vehicleTypeId}
                    alt={`${v.brand} ${v.model}`}
                    className="h-24 w-28 rounded-xl"
                  />
                  {inCart && (
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary/5" aria-hidden />
                  )}
                  <div className="absolute left-1.5 top-1.5">
                    <VehicleSelectCheckbox
                      checked={inCart}
                      ariaLabel={`选择 ${v.plateNumber}`}
                      onChange={() => handleToggleVehicle(v)}
                    />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug">
                        {v.brand} {v.model}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {vehicleTypeLabel[v.vehicleTypeId] ?? v.vehicleTypeId} · {v.plateNumber} · {v.city}
                      </p>
                    </div>
                    {inCart && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        已选
                      </span>
                    )}
                  </div>
                  <p className="text-primary font-bold">
                    {formatMoney(v.dailyPrice)}
                    <span className="text-xs font-normal text-muted-foreground">/天</span>
                  </p>
                  <div
                    className="flex flex-wrap items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <VehicleServiceModeChips
                      value={getRowMode(v)}
                      onChange={(mode) => handleSetRowMode(v, mode)}
                      compact
                    />
                    <div className="flex items-center gap-2">
                      <DetailLinkButton to={`/vehicles/${v.id}?from=home`} />
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          getRowMode(v) === "WITH_DRIVER" ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {getRowMode(v) === "WITH_DRIVER" ? "免驾照" : "须驾照"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && sortedFleet.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">该条件下暂无可租车辆</p>
          )}
        </div>
      )}

      <button
        type="button"
        className="w-full rounded-xl border border-dashed border-primary/50 py-3 text-center text-sm text-primary"
        onClick={() => navigate("/booking")}
      >
        高级选车（自定义租期 / 计费方式）
      </button>

      <VehicleCartBar canRent={canRent} rentBlockMessage={account?.message} />
    </div>
  );
}
