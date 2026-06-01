import { serviceModeLabel, type PerVehicleServiceMode } from "@rental-preview/shared";
import { cn } from "../lib/utils";

type VehicleServiceModeChipsProps = {
  value: PerVehicleServiceMode;
  onChange: (mode: PerVehicleServiceMode) => void;
  compact?: boolean;
  disabled?: boolean;
};

export const VehicleServiceModeChips = ({
  value,
  onChange,
  compact = false,
  disabled = false
}: VehicleServiceModeChipsProps) => (
  <div
    className={cn("inline-flex rounded-lg border border-border p-0.5", compact && "text-[10px]")}
    role="group"
    aria-label="服务方式"
    onClick={(e) => e.stopPropagation()}
  >
    {(["SELF_DRIVE", "WITH_DRIVER"] as const).map((mode) => (
      <button
        key={mode}
        type="button"
        disabled={disabled}
        className={cn(
          "rounded-md px-2 py-0.5 font-medium transition-colors",
          compact ? "px-1.5" : "px-2.5 py-1 text-xs",
          value === mode
            ? mode === "WITH_DRIVER"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-foreground"
            : "text-muted-foreground"
        )}
        onClick={() => onChange(mode)}
      >
        {mode === "WITH_DRIVER" ? "包车" : serviceModeLabel[mode].slice(0, 2)}
      </button>
    ))}
  </div>
);
