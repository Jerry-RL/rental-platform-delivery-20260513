export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
};

export function DataTable<T extends { id: string }>({ columns, rows, emptyText = "暂无数据" }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }
  return (
    <div className="relative w-full overflow-auto rounded-md border border-border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b border-border">
          <tr className="border-b border-border bg-muted/50 transition-colors">
            {columns.map((c) => (
              <th key={c.key} className="h-10 px-3 text-left align-middle font-medium text-muted-foreground">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/30">
              {columns.map((c) => (
                <td key={c.key} className="p-3 align-middle">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
