import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { DriverFormPanel } from "../features/panels/DriverFormPanel";
import { DriverListPanel } from "../features/panels/DriverListPanel";
import { useDriverList } from "../hooks/useDriverList";

export function DriversPage() {
  const { core, setMessage } = useAdminFlowContext();
  const list = useDriverList(core.headers, setMessage);

  const handleSearch = () => {
    list.setPage(1);
    if (list.page === 1) void list.load();
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="司机管理" description="维护司机档案、驾照扫描件上传（URL）与到期提醒，支持带驾订单指派。" />

      {list.formMode ? (
        <DriverFormPanel
          mode={list.formMode}
          form={list.form}
          onChange={list.setForm}
          onSave={list.handleSave}
          onCancel={list.closeForm}
        />
      ) : null}

      <DriverListPanel
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
        onStatusChange={list.handleStatusChange}
      />
    </div>
  );
}
