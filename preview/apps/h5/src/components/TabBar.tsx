import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

const tabs = [
  { to: "/home", label: "租车", icon: "🚗" },
  { to: "/orders", label: "订单", icon: "📋" },
  { to: "/billing", label: "账单", icon: "💳" },
  { to: "/me", label: "我的", icon: "👤" }
] as const;

export function TabBar() {
  return (
    <nav
      className="safe-bottom fixed bottom-0 left-0 right-0 z-50 bar-surface"
      aria-label="主导航"
    >
      <div className="mx-auto flex max-w-phone justify-around px-2 py-1.5">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                "flex min-w-[4rem] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "bg-primary/8 font-medium text-primary"
                  : "text-muted-foreground"
              )
            }
          >
            <span className="text-lg" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
