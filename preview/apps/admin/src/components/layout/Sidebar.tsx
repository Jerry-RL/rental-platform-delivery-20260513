import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { cn } from "../../lib/utils";

const STORAGE_KEY = "rental_admin_sidebar_groups";

const navGroups = [
  {
    title: "概览",
    items: [{ to: "/dashboard", label: "运营看板" }]
  },
  {
    title: "用户与组织",
    items: [
      { to: "/users", label: "用户认证" },
      { to: "/orgs/customers", label: "企业客户" },
      { to: "/orgs/members", label: "企业用户" },
      { to: "/orgs/approvals", label: "开通审批" }
    ]
  },
  {
    title: "车辆管理",
    items: [
      { to: "/vehicles/inventory", label: "车辆库存" },
      { to: "/vehicles/history", label: "生命周期" },
      { to: "/vehicles/mileage", label: "里程保养" },
      { to: "/vehicles/violations", label: "违章查询" },
      { to: "/vehicles/maintenance", label: "维保送修" }
    ]
  },
  {
    title: "订单管理",
    items: [
      { to: "/orders", label: "订单列表" },
      { to: "/incidents", label: "事故处理" }
    ]
  },
  {
    title: "定价管理",
    items: [{ to: "/pricing", label: "定价策略" }]
  },
  {
    title: "交易与财务",
    items: [
      { to: "/payments", label: "支付退款" },
      { to: "/finance", label: "账单对账" },
      { to: "/invoices", label: "电子发票" }
    ]
  },
  {
    title: "客服与运营",
    items: [
      { to: "/tickets", label: "客服工单" },
      { to: "/operations", label: "成本与优惠" }
    ]
  },
  {
    title: "人员与扩展",
    items: [
      { to: "/staff", label: "司机与人员" },
      { to: "/extensions", label: "GPS/地图" }
    ]
  }
] as const;

type GroupTitle = (typeof navGroups)[number]["title"];

const defaultOpenState = (): Record<string, boolean> =>
  Object.fromEntries(navGroups.map((g) => [g.title, true]));

const loadOpenState = (): Record<string, boolean> => {
  if (typeof localStorage === "undefined") return defaultOpenState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOpenState();
    return { ...defaultOpenState(), ...JSON.parse(raw) };
  } catch {
    return defaultOpenState();
  }
};

const isPathInGroup = (pathname: string, group: (typeof navGroups)[number]) =>
  group.items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));

export function Sidebar() {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(loadOpenState);

  const activeGroupTitle = useMemo(
    () => navGroups.find((g) => isPathInGroup(pathname, g))?.title,
    [pathname]
  );

  useEffect(() => {
    if (!activeGroupTitle) return;
    setOpenGroups((prev) => {
      if (prev[activeGroupTitle]) return prev;
      const next = { ...prev, [activeGroupTitle]: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [activeGroupTitle]);

  const setGroupOpen = useCallback((title: GroupTitle, open: boolean) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [title]: open };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const allExpanded = navGroups.every((g) => openGroups[g.title] !== false);
  const handleToggleAll = () => {
    const nextOpen = !allExpanded;
    const next = Object.fromEntries(navGroups.map((g) => [g.title, nextOpen]));
    setOpenGroups(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <aside className="flex w-full flex-col border-b border-border bg-card md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="hidden border-b border-border p-4 md:block">
        <p className="text-xs text-muted-foreground">方案预览 · Mock API</p>
        <p className="font-semibold">管理后台</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 md:p-3" aria-label="管理端导航">
        <div className="mb-2 hidden justify-end md:flex">
          <button
            type="button"
            className="rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleToggleAll}
            aria-label={allExpanded ? "收起全部模块" : "展开全部模块"}
          >
            {allExpanded ? "全部收起" : "全部展开"}
          </button>
        </div>

        {navGroups.map((g) => {
          const isOpen = openGroups[g.title] !== false;
          const groupActive = g.title === activeGroupTitle;

          return (
            <Collapsible
              key={g.title}
              open={isOpen}
              onOpenChange={(open) => setGroupOpen(g.title, open)}
              className="mb-1"
            >
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-accent/60",
                  "md:px-2.5",
                  groupActive && "bg-accent/40 text-foreground"
                )}
                aria-expanded={isOpen}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    !isOpen && "-rotate-90"
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 font-medium">{g.title}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">{g.items.length}</span>
              </CollapsibleTrigger>

              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <ul className="mb-2 ml-3 flex flex-col gap-0.5 border-l border-border pl-2 md:ml-4 md:pl-2.5">
                  {g.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
                            isActive
                              ? "bg-primary font-medium text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    </aside>
  );
}
