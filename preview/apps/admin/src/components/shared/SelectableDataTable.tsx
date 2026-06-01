import type { Column } from "./DataTable";
import { cn } from "../../lib/utils";

export type { Column };

type SelectableDataTableProps<T extends { id: string }> = {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  /** 与编辑/删除同列展示的自定义操作 */
  renderRowActions?: (row: T) => React.ReactNode;
};

export function SelectableDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyText = "暂无数据",
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  renderRowActions
}: SelectableDataTableProps<T>) {
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (allSelected) onSelectionChange([]);
    else onSelectionChange(rows.map((r) => r.id));
  };

  const toggleOne = (id: string) => {
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  const actionCols = onEdit || onDelete || renderRowActions;

  return (
    <div className="relative w-full overflow-auto rounded-md border border-border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b border-border">
          <tr className="border-b border-border bg-muted/50">
            <th className="h-10 w-10 px-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="全选" />
            </th>
            {columns.map((c) => (
              <th key={c.key} className="h-10 px-3 text-left font-medium text-muted-foreground">
                {c.header}
              </th>
            ))}
            {actionCols && <th className="h-10 px-3 text-left font-medium text-muted-foreground">操作</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border hover:bg-muted/30">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(row.id)}
                  onChange={() => toggleOne(row.id)}
                  aria-label={`选择 ${row.id}`}
                />
              </td>
              {columns.map((c) => (
                <td key={c.key} className="p-3 align-middle">
                  {c.render(row)}
                </td>
              ))}
              {actionCols && (
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {renderRowActions?.(row)}
                    {onEdit && (
                      <button
                        type="button"
                        className="rounded px-2 py-0.5 text-xs text-primary hover:bg-accent"
                        onClick={() => onEdit(row)}
                      >
                        编辑
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className={cn(
                          "rounded px-2 py-0.5 text-xs text-destructive hover:bg-destructive/10"
                        )}
                        onClick={() => onDelete(row)}
                      >
                        删除
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
