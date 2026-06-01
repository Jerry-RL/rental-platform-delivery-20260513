import { useNavigate } from "react-router-dom";
import {
  canReorderOrder,
  formatMoney,
  serviceModeLabel,
  type Order
} from "@rental-preview/shared";
import { useReorder } from "../hooks/useReorder";
import { useVehicleCart } from "../hooks/useVehicleCart";
import { cn } from "../lib/utils";

type HomeQuickActionsProps = {
  recentOrders: Order[];
  className?: string;
};

const SHORTCUTS = [
  { id: "fleet", label: "选车", sub: "按车辆", path: "/home" },
  { id: "orders", label: "订单", sub: "全部", path: "/orders" },
  { id: "license", label: "驾照", sub: "认证", path: "/license" },
  { id: "realname", label: "实名", sub: "认证", path: "/realname" }
] as const;

export const HomeQuickActions = ({ recentOrders, className }: HomeQuickActionsProps) => {
  const navigate = useNavigate();
  const cart = useVehicleCart();
  const { reorder, reordering } = useReorder();

  const reorderable = recentOrders.filter(canReorderOrder).slice(0, 3);

  return (
    <section className={cn("card-surface p-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">快捷操作</h3>
        <button
          type="button"
          className="text-xs text-primary"
          onClick={() => navigate("/orders")}
        >
          全部订单 ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {SHORTCUTS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="flex flex-col items-center rounded-xl border border-border bg-muted/30 py-2.5 text-center active:bg-muted/60"
            onClick={() => navigate(s.path)}
          >
            <span className="text-lg leading-none" aria-hidden>
              {s.id === "fleet" ? "🚗" : s.id === "orders" ? "📋" : s.id === "license" ? "🪪" : "✓"}
            </span>
            <span className="mt-1 text-xs font-semibold">{s.label}</span>
            <span className="text-[10px] text-muted-foreground">{s.sub}</span>
          </button>
        ))}
        <button
          type="button"
          className={cn(
            "relative flex flex-col items-center rounded-xl border py-2.5 text-center active:scale-[0.98]",
            cart.count > 0
              ? "border-primary bg-primary/10"
              : "border-dashed border-border bg-muted/20"
          )}
          onClick={() => {
            if (cart.count === 0) {
              navigate("/home");
              return;
            }
            navigate("/booking?cart=1");
          }}
        >
          {cart.count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {cart.count}
            </span>
          )}
          <span className="text-lg" aria-hidden>
            🛒
          </span>
          <span className="mt-1 text-xs font-semibold">租车篮</span>
          <span className="text-[10px] text-muted-foreground">
            {cart.count > 0 ? "去结算" : "先选车"}
          </span>
        </button>
      </div>

      {reorderable.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">再次下单</p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {reorderable.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={reordering}
                className="flex shrink-0 flex-col rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-left active:bg-primary/10 disabled:opacity-60"
                onClick={() => void reorder(o)}
              >
                <span className="text-xs font-semibold text-foreground">{o.plateNumber}</span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  {serviceModeLabel[o.serviceMode]} · {formatMoney(o.totalFee)}
                </span>
                <span className="mt-1 text-[10px] font-medium text-primary">一键复购 ›</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
