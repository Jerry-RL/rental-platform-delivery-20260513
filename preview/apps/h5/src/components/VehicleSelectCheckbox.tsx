import { cn } from "../lib/utils";

type VehicleSelectCheckboxProps = {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
  /** 部分选中（如全选本页未全满） */
  indeterminate?: boolean;
};

export const VehicleSelectCheckbox = ({
  checked,
  onChange,
  ariaLabel,
  size = "md",
  className,
  indeterminate = false
}: VehicleSelectCheckboxProps) => {
  const active = checked || indeterminate;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
        size === "md" ? "h-7 w-7" : "h-6 w-6",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-transparent hover:border-primary/40",
        className
      )}
    >
      {checked && !indeterminate && (
        <svg
          className={cn(size === "md" ? "h-4 w-4" : "h-3.5 w-3.5")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          aria-hidden
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {indeterminate && !checked && (
        <span className={cn("rounded-sm bg-primary-foreground", size === "md" ? "h-0.5 w-3" : "h-0.5 w-2.5")} />
      )}
    </button>
  );
};
