import {
  ORDER_LEVEL_SERVICE_MODES,
  SERVICE_MODE_META,
  serviceModeLabel,
  type ServiceMode
} from "@rental-preview/shared";
import { cn } from "../lib/utils";

type ServiceModeCardsProps = {
  value: ServiceMode;
  onChange: (mode: ServiceMode) => void;
};

export function ServiceModeCards({ value, onChange }: ServiceModeCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-1">
      {ORDER_LEVEL_SERVICE_MODES.map((mode) => {
        const meta = SERVICE_MODE_META[mode];
        const selected = value === mode;
        return (
          <button
            key={mode}
            type="button"
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              selected ? "chip-active" : "chip-idle"
            )}
            onClick={() => onChange(mode)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{serviceModeLabel[mode]}</span>
              {meta.needLicense ? (
                <span className="rounded bg-warning/15 px-2 py-0.5 text-[10px] text-warning">
                  {mode === "MIXED" ? "含自驾·需驾照" : "需驾照"}
                </span>
              ) : (
                <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] text-success">免驾照</span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{meta.subtitle}</p>
            <ul className="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
              {meta.bullets.slice(0, 2).map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
