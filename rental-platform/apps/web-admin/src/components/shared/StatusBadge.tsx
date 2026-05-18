import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const variantMap: Record<string, "secondary" | "success" | "warning" | "default"> = {
  AVAILABLE: "success",
  ACTIVE: "success",
  CONFIRMED: "success",
  COMPLETED: "success",
  SETTLED: "success",
  IN_USE: "default",
  ON_DUTY: "default",
  PENDING_PAYMENT: "warning",
  PAYMENT_FAILED: "warning",
  MAINTENANCE: "warning",
  OFF_DUTY: "warning",
  SUSPENDED: "warning",
  INACTIVE: "secondary",
  CANCELED: "secondary",
  EXPIRING_SOON: "warning",
  EXPIRED: "secondary",
  UNKNOWN: "secondary"
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
