import { cn } from "../../lib/utils";

type Props = {
  message: string;
  variant?: "default" | "success" | "warning";
};

export function StatusBar({ message, variant = "default" }: Props) {
  const display = message || "等待操作…";

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border bg-card/95 px-4 py-3 text-sm backdrop-blur supports-[backdrop-filter]:bg-card/80",
        variant === "success" && "text-success",
        variant === "warning" && "text-warning",
        variant === "default" && "text-primary"
      )}
      role="status"
      aria-live="polite"
    >
      {display}
    </div>
  );
}
