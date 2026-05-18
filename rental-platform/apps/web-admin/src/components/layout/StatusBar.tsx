import { cn } from "../../lib/utils";

type Props = {
  message: string;
};

export function StatusBar({ message }: Props) {
  const display = message || "等待操作…";

  return (
    <div
      className={cn("shrink-0 border-t border-border bg-card/95 px-4 py-3 text-sm text-primary backdrop-blur")}
      role="status"
      aria-live="polite"
    >
      {display}
    </div>
  );
}
