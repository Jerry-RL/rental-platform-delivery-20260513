import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

export type PageTabItem = {
  to: string;
  label: string;
  /** 可选角标，如数量 */
  badge?: React.ReactNode;
};

type PageTabsProps = {
  tabs: PageTabItem[];
  className?: string;
  ariaLabel?: string;
};

export function PageTabs({ tabs, className, ariaLabel = "页面分区" }: PageTabsProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 -mx-1 border-b border-border bg-background px-1 pb-0",
        className
      )}
    >
      <nav className="flex gap-1 overflow-x-auto scrollbar-none" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              cn(
                "relative shrink-0 whitespace-nowrap rounded-t-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )
            }
          >
            <span className="inline-flex items-center gap-1.5">
              {tab.label}
              {tab.badge}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
