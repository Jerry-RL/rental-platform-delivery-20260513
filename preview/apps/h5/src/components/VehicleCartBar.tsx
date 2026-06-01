import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatMoney, serviceModeLabel, type VehicleCartItem } from "@rental-preview/shared";
import { useOrderAgreement } from "../hooks/useOrderAgreement";
import { useVehicleCart } from "../hooks/useVehicleCart";
import { OrderAgreementPanel } from "./OrderAgreementPanel";
import { VehicleImage } from "./VehicleImage";
import { cn } from "../lib/utils";

type VehicleCartBarProps = {
  className?: string;
  canRent?: boolean;
  rentBlockMessage?: string;
};

const CartItemChip = ({ item }: { item: VehicleCartItem }) => {
  const withDriver = item.serviceMode === "WITH_DRIVER";
  return (
    <div
      className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card py-1.5 pl-1.5 pr-2.5"
      title={`${item.brand} ${item.model} · ${item.plateNumber}`}
    >
      <VehicleImage
        src={item.imageUrl}
        vehicleId={item.vehicleId}
        vehicleTypeId={item.vehicleTypeId}
        alt={item.plateNumber}
        className="h-9 w-11 shrink-0 rounded-md"
      />
      <div className="min-w-0">
        <p className="max-w-[5rem] truncate text-[11px] font-semibold leading-tight">
          {item.plateNumber}
        </p>
        <p className="max-w-[5rem] truncate text-[10px] text-muted-foreground">{item.brand}</p>
        <span
          className={cn(
            "mt-0.5 inline-block rounded px-1 py-px text-[10px] font-medium leading-none",
            withDriver ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {withDriver ? "包车" : serviceModeLabel.SELF_DRIVE}
        </span>
      </div>
    </div>
  );
};

export const VehicleCartBar = ({
  className = "",
  canRent = true,
  rentBlockMessage
}: VehicleCartBarProps) => {
  const navigate = useNavigate();
  const { count, dailyTotal, items, city, clear, modeCounts, remove } = useVehicleCart();
  const { accepted, accept } = useOrderAgreement();
  const [expanded, setExpanded] = useState(count <= 2);
  const [showAgreementSheet, setShowAgreementSheet] = useState(false);
  const [sheetChecked, setSheetChecked] = useState(false);

  if (count === 0) return null;

  const checkoutUrl = "/booking?cart=1";

  const goCheckout = () => {
    if (!canRent) {
      alert(rentBlockMessage ?? "请先完成 B/G 端账号认证");
      return;
    }
    if (!accepted) {
      setSheetChecked(false);
      setShowAgreementSheet(true);
      return;
    }
    navigate(checkoutUrl);
  };

  const handleConfirmCheckout = () => {
    if (!sheetChecked) return;
    accept();
    setShowAgreementSheet(false);
    navigate(checkoutUrl);
  };

  const licenseHint =
    modeCounts.selfDrive > 1
      ? `自驾 ${modeCounts.selfDrive} 台 · 须 ${modeCounts.selfDrive} 名司机驾照`
      : null;

  return (
    <>
      <div
        className={cn(
          "above-tab-bar fixed left-0 right-0 z-40 bar-surface safe-bottom",
          className
        )}
      >
        <div className="mx-auto max-w-phone">
          {items.length > 0 && (
            <div className="border-b border-border/60 px-3 pt-2">
              <button
                type="button"
                className="mb-1.5 flex w-full items-center justify-between text-[11px] text-muted-foreground"
                aria-expanded={expanded}
                onClick={() => setExpanded((e) => !e)}
              >
                <span>
                  已选车辆 {count} 台
                  {licenseHint && <span className="ml-2 text-warning">{licenseHint}</span>}
                </span>
                <span className="text-primary">{expanded ? "收起 ▲" : "展开 ▼"}</span>
              </button>
              {expanded && (
                <div
                  className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-label="已选车辆列表"
                >
                  {items.map((item) => (
                    <div key={item.vehicleId} className="relative shrink-0">
                      <CartItemChip item={item} />
                      <button
                        type="button"
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground shadow ring-1 ring-border"
                        aria-label={`移除 ${item.plateNumber}`}
                        onClick={() => remove(item.vehicleId)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-stretch gap-2 px-3 py-2.5">
            <button
              type="button"
              className="flex min-w-0 flex-1 flex-col justify-center rounded-xl bg-muted/50 px-3 py-2 text-left active:bg-muted"
              onClick={() => setExpanded((e) => !e)}
              aria-label={`租车篮 ${count} 台，日租合计 ${formatMoney(dailyTotal)}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">{count}</span>
                <span className="text-xs text-muted-foreground">台</span>
                <span className="text-sm font-bold text-foreground">{formatMoney(dailyTotal)}</span>
                <span className="text-[10px] text-muted-foreground">/日</span>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {modeCounts.isMixed && (
                  <span className="text-[10px] font-medium text-warning">混合</span>
                )}
                {modeCounts.withDriver > 0 && (
                  <span className="text-[10px] text-primary">包车×{modeCounts.withDriver}</span>
                )}
                {modeCounts.selfDrive > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    自驾×{modeCounts.selfDrive}
                  </span>
                )}
                {city && <span className="text-[10px] text-muted-foreground">· {city}</span>}
              </div>
            </button>

            <button
              type="button"
              className="shrink-0 rounded-xl border border-border px-3 py-2.5 text-xs font-medium text-muted-foreground active:bg-muted"
              onClick={() => {
                if (window.confirm(`确定清空租车篮中的 ${count} 台车？`)) clear();
              }}
            >
              清空
            </button>

            <button
              type="button"
              disabled={!canRent}
              className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-primary-foreground active:scale-[0.98] disabled:opacity-45"
              onClick={goCheckout}
            >
              <span className="text-sm font-bold leading-tight">去结算</span>
              <span className="mt-0.5 text-[10px] opacity-90">{count} 台</span>
            </button>
          </div>

          {!accepted && (
            <p className="border-t border-border/50 px-3 py-1.5 text-center text-[10px] text-muted-foreground">
              结算前需阅读并同意
              <button
                type="button"
                className="text-primary underline-offset-2 hover:underline"
                onClick={() => {
                  setSheetChecked(false);
                  setShowAgreementSheet(true);
                }}
              >
                订单前必读协议
              </button>
            </p>
          )}
        </div>
      </div>

      {showAgreementSheet && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55"
          role="dialog"
          aria-modal="true"
          aria-label="订单前必读"
          onClick={() => setShowAgreementSheet(false)}
        >
          <div
            className="flex w-full max-w-phone max-h-[78vh] flex-col rounded-t-2xl bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 justify-center border-t border-border pt-2">
              <span className="h-1 w-10 rounded-full bg-muted" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <OrderAgreementPanel
                variant="sheet"
                checked={sheetChecked}
                onCheckedChange={setSheetChecked}
              />
            </div>
            <div className="flex shrink-0 gap-2 border-t border-border bg-white px-4 pb-tab-bar pt-4">
              <button
                type="button"
                className="flex-1 rounded-xl border border-border py-3 text-sm text-muted-foreground"
                onClick={() => setShowAgreementSheet(false)}
              >
                继续选车
              </button>
              <button
                type="button"
                disabled={!sheetChecked}
                className="flex-[1.2] rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                onClick={handleConfirmCheckout}
              >
                同意并去结算
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
