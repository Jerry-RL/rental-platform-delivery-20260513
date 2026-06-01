import { Button } from "../ui/button";

export type BatchAction = {
  label: string;
  patch: Record<string, unknown>;
  variant?: "default" | "outline" | "destructive";
};

type CrudToolbarProps = {
  selectedCount: number;
  onCreate: () => void;
  onBatchDelete: () => void;
  batchActions?: BatchAction[];
  onBatchAction: (patch: Record<string, unknown>) => void;
  disabled?: boolean;
};

export function CrudToolbar({
  selectedCount,
  onCreate,
  onBatchDelete,
  batchActions = [],
  onBatchAction,
  disabled
}: CrudToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" onClick={onCreate} disabled={disabled}>
        新建
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || selectedCount === 0}
        onClick={onBatchDelete}
      >
        批量删除{selectedCount > 0 ? ` (${selectedCount})` : ""}
      </Button>
      {batchActions.map((a) => (
        <Button
          key={a.label}
          type="button"
          size="sm"
          variant={a.variant ?? "outline"}
          disabled={disabled || selectedCount === 0}
          onClick={() => onBatchAction(a.patch)}
        >
          {a.label}
        </Button>
      ))}
      <span className="text-xs text-muted-foreground">增删改查 · POST/PUT/DELETE · batch-delete/update</span>
    </div>
  );
}
