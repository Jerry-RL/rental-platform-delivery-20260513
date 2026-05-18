import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const variantMap: Record<string, "secondary" | "success" | "warning" | "default"> = {
  CONFIRMED: "success",
  COMPLETED: "success",
  SETTLED: "success",
  IN_USE: "default",
  PENDING_PAYMENT: "warning",
  PAYMENT_FAILED: "warning",
  CANCELED: "secondary"
};

type Props = {
  label: string;
  status: string;
  className?: string;
};

export function StatusBadge({ label, status, className }: Props) {
  return (
    <Badge variant={variantMap[status] ?? "secondary"} className={cn("font-normal", className)}>
      {label}
    </Badge>
  );
}
