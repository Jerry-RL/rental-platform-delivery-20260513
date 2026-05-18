import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/vehicles", label: "车辆管理", description: "库存列表" },
  { to: "/drivers", label: "司机管理", description: "司机档案" },
  { to: "/personnel", label: "人员管理", description: "内部员工" },
  { to: "/users", label: "用户管理", description: "普通/企业用户" },
  { to: "/orders", label: "订单列表", description: "全平台订单" },
  { to: "/core", label: "核心流程", description: "订单处理" },
  { to: "/violations", label: "批量违章", description: "任务管理" },
  { to: "/quota", label: "配额成本", description: "配额与台账" },
  { to: "/reminders", label: "到期提醒", description: "规则与日志" },
  { to: "/map-gps", label: "地图 GPS", description: "策略与快照" }
] as const;

export function Sidebar() {
  return (
    <aside className="flex w-full flex-col border-b border-border bg-card md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible md:p-4" aria-label="管理端导航">
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
            <span className="hidden text-xs opacity-80 md:block">{item.description}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
