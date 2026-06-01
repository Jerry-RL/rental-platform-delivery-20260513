import { cn } from "../lib/utils";

type Option = { value: string; label: string; disabled?: boolean };

type OptionChipsProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3;
};

export function OptionChips({ options, value, onChange, columns = 2 }: OptionChipsProps) {
  return (
    <div className={cn("grid gap-2", columns === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors",
            value === o.value
              ? "chip-active"
              : "chip-idle",
            o.disabled && "opacity-40"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
