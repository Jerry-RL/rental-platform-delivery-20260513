import { useState } from "react";
import { ListFilterForm } from "./ListFilterForm";
import { SelectableDataTable, type Column } from "./SelectableDataTable";
import { CrudToolbar, type BatchAction } from "./CrudToolbar";
import { FormDialog, type CrudFieldDef } from "./FormDialog";
import { useFilteredList } from "../../hooks/useFilteredList";
import { useAdminCrud } from "../../hooks/useAdminCrud";

type FilterField = Parameters<typeof ListFilterForm>[0]["fields"][number];

type AdminCrudPanelProps<T extends { id: string }> = {
  resource: string;
  listPath: string;
  initialFilters?: Record<string, string>;
  filterFields?: FilterField[];
  columns: Column<T>[];
  formFields: CrudFieldDef[];
  editFormFields?: CrudFieldDef[];
  prepareEditValues?: (row: T) => Record<string, unknown>;
  batchActions?: BatchAction[];
  pageSize?: string;
  emptyText?: string;
  renderRowActions?: (row: T) => React.ReactNode;
};

export function AdminCrudPanel<T extends { id: string }>({
  resource,
  listPath,
  initialFilters = {},
  filterFields = [],
  columns,
  formFields,
  editFormFields,
  prepareEditValues,
  batchActions = [],
  pageSize,
  emptyText,
  renderRowActions
}: AdminCrudPanelProps<T>) {
  const list = useFilteredList<T>(listPath, initialFilters);
  const crud = useAdminCrud(resource);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const refresh = () => {
    list.reload();
    setSelectedIds([]);
  };

  const handleCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: T) => {
    setEditing(row);
    setDialogOpen(true);
  };

  const dialogFields = editing && editFormFields ? editFormFields : formFields;
  const dialogInitial = editing
    ? prepareEditValues
      ? prepareEditValues(editing)
      : (editing as Record<string, unknown>)
    : undefined;

  const handleDelete = async (row: T) => {
    if (!confirm(`确认删除该记录？`)) return;
    if (await crud.remove(row.id)) refresh();
  };

  const handleBatchDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`确认批量删除 ${selectedIds.length} 条？`)) return;
    if (await crud.batchDelete(selectedIds)) refresh();
  };

  const handleBatchAction = async (patch: Record<string, unknown>) => {
    if (!selectedIds.length) return;
    if (await crud.batchUpdate(selectedIds, patch)) refresh();
  };

  const normalizeSubmit = (values: Record<string, unknown>) => {
    const out = { ...values };
    if (typeof out.roleCodes === "string") {
      out.roleCodes = out.roleCodes
        .split(/[,，\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return out;
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload = normalizeSubmit(values);
    const ok = editing
      ? await crud.update(editing.id, payload)
      : await crud.create(payload);
    if (ok) {
      setDialogOpen(false);
      refresh();
    }
  };

  return (
    <div className="space-y-4">
      <CrudToolbar
        selectedCount={selectedIds.length}
        onCreate={handleCreate}
        onBatchDelete={handleBatchDelete}
        batchActions={batchActions}
        onBatchAction={handleBatchAction}
        disabled={crud.busy}
      />
      {(crud.message || list.loading) && (
        <p className="text-sm text-primary">{list.loading ? "加载中…" : crud.message}</p>
      )}
      {filterFields.length > 0 && (
        <ListFilterForm
          fields={filterFields}
          values={list.filters}
          onChange={list.setFilter}
          onSearch={list.search}
          onReset={list.reset}
          loading={list.loading}
        />
      )}
      <SelectableDataTable
        rows={list.items}
        columns={columns}
        emptyText={emptyText ?? (list.loading ? "加载中…" : "暂无数据")}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderRowActions={renderRowActions}
      />
      <FormDialog
        open={dialogOpen}
        title={editing ? "编辑" : "新建"}
        fields={dialogFields}
        initialValues={dialogInitial}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        submitting={crud.busy}
      />
    </div>
  );
}
