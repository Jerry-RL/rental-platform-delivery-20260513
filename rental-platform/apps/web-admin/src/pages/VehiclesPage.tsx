import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { VehicleFormPanel } from "../features/panels/VehicleFormPanel";
import { VehicleListPanel } from "../features/panels/VehicleListPanel";
import { useVehicleList } from "../hooks/useVehicleList";

export function VehiclesPage() {
  const { core, setMessage } = useAdminFlowContext();
  const list = useVehicleList(core.headers, setMessage);

  const handleSearch = () => {
    list.setPage(1);
    if (list.page === 1) void list.load();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader title="车辆管理" description="车辆档案全生命周期管理：增删改查、图片展示、保险与年检到期提醒。" />

      {list.formMode ? (
        <VehicleFormPanel
          mode={list.formMode}
          form={list.form}
          onChange={list.setForm}
          onSave={list.handleSave}
          onCancel={list.closeForm}
        />
      ) : null}

      <VehicleListPanel
        filters={list.filters}
        loading={list.loading}
        items={list.result.items}
        total={list.result.total}
        page={list.page}
        pageSize={list.pageSize}
        onFiltersChange={list.setFilters}
        onSearch={handleSearch}
        onPageChange={list.setPage}
        onCreate={list.openCreate}
        onEdit={list.openEdit}
        onDelete={list.handleDelete}
        onStatusChange={list.handleStatusChange}
      />
    </div>
  );
}
