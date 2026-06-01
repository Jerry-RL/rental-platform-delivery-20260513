import {
  CONFIRM_SERVICE_START_LABEL,
  formatMoney,
  getConfirmPickupDialogMessage,
  getOrderQuickActions,
  type Order,
  type OrderQuickActionId
} from "@rental-preview/shared";
import { useReorder } from "../hooks/useReorder";
import { cn } from "../lib/utils";

type OrderQuickActionsProps = {
  order: Order;
  unpaid?: number;
  hasIssuedInvoice?: boolean;
  onPay?: () => void;
  onConfirmPickup?: () => void;
  onInvoice?: () => void;
  onIncident?: () => void;
  /** 列表卡片用紧凑横向按钮 */
  compact?: boolean;
  /** 详情页等场景由独立主按钮承担，不在此重复展示 */
  hideServiceStart?: boolean;
  className?: string;
};

export const OrderQuickActions = ({
  order,
  unpaid = 0,
  hasIssuedInvoice = false,
  onPay,
  onConfirmPickup,
  onInvoice,
  onIncident,
  compact = false,
  hideServiceStart = false,
  className
}: OrderQuickActionsProps) => {
  const { reorder, reordering } = useReorder();
  const actions = getOrderQuickActions(order, { unpaid, hasIssuedInvoice }).filter(
    (a) => !(hideServiceStart && a.id === "confirm_pickup")
  );

  if (actions.length === 0) return null;

  const run = (id: OrderQuickActionId) => {
    if (id === "reorder") void reorder(order);
    else if (id === "pay") onPay?.();
    else if (id === "confirm_pickup") {
      if (!window.confirm(getConfirmPickupDialogMessage(order.serviceMode))) return;
      onConfirmPickup?.();
    } else if (id === "invoice") onInvoice?.();
    else if (id === "incident") onIncident?.();
    else if (id === "contact") {
      const store = order.pickupStoreId;
      alert(`联系门店（演示）\n取车门店 ID：${store}\n客服 400-888-6688`);
    }
  };

  return (
    <div
      className={cn(
        compact ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={action.id === "reorder" && reordering}
          className={cn(
            "rounded-full border text-xs font-medium transition-colors active:scale-[0.98]",
            compact ? "px-3 py-1.5" : "px-4 py-2 text-sm",
            action.primary &&
              "border-primary bg-primary text-primary-foreground shadow-sm",
            action.destructive &&
              !action.primary &&
              "border-warning/50 text-warning",
            !action.primary &&
              !action.destructive &&
              "border-border bg-card text-foreground",
            action.id === "reorder" && reordering && "opacity-60"
          )}
          onClick={() => run(action.id)}
        >
          {            action.id === "pay" && unpaid > 0
              ? `${action.label} ${formatMoney(unpaid)}`
              : action.id === "confirm_pickup" && compact
                ? "确认服务开始"
                : action.id === "confirm_pickup"
                  ? CONFIRM_SERVICE_START_LABEL
                  : action.label}
        </button>
      ))}
    </div>
  );
};
