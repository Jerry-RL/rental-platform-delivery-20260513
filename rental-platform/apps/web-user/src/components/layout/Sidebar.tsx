import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/booking", label: "租车", description: "查车与下单" },
  { to: "/orders", label: "订单", description: "订单详情" },
  { to: "/billing", label: "账单", description: "账单与支付" },
  { to: "/services", label: "服务", description: "提醒与 GPS" }
] as const;

export function Sidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-border bg-card md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible md:p-4" aria-label="主导航">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex min-w-[5.5rem] flex-col rounded-lg px-3 py-2.5 text-left transition-colors md:min-w-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <span className="text-sm font-medium">{item.label}</span>
            <span className={cn("hidden text-xs md:block", "opacity-80")}>{item.description}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
