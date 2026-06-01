import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export const selectTriggerClassName = cn(
  "flex h-9 w-full cursor-pointer appearance-none rounded-md border border-input bg-card px-3 py-2 pr-9 text-sm text-foreground shadow-sm",
  "transition-[color,background-color,border-color,box-shadow]",
  "hover:border-muted-foreground/40 hover:bg-accent/40",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-card"
);

type SelectProps = Omit<React.ComponentProps<"select">, "children"> & {
  options: { value: string; label: string }[];
  placeholder?: string;
  /** 外层容器样式（宽度、外边距等） */
  wrapperClassName?: string;
};

export function Select({
  className,
  wrapperClassName,
  options,
  placeholder,
  value,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <select className={cn(selectTriggerClassName, className)} value={value} {...props}>
        {placeholder !== undefined && (
          <option value="" className="bg-card text-muted-foreground">
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-card text-foreground">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
