import { cn } from "../../lib/utils";

type Props = {
  value: unknown;
  emptyText?: string;
  className?: string;
};

export function JsonViewer({ value, emptyText = "暂无数据", className }: Props) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2);

  if (!text) {
    return <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <pre className={cn("max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100", className)}>
      {text}
    </pre>
  );
}
