import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { PersonnelListPanel } from "../features/panels/PersonnelListPanel";
import { usePersonnelList } from "../hooks/usePersonnelList";

export function PersonnelPage() {
  const { core, setMessage } = useAdminFlowContext();
  const list = usePersonnelList(core.headers, setMessage);

  const handleSearch = () => {
    list.setPage(1);
    if (list.page === 1) void list.load();
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="人员管理" description="管理内部员工账号、角色权限与在职状态。" />
      <PersonnelListPanel
        filters={list.filters}
        createForm={list.createForm}
        loading={list.loading}
        items={list.result.items}
        total={list.result.total}
        page={list.page}
        pageSize={list.pageSize}
        onFiltersChange={list.setFilters}
        onCreateFormChange={list.setCreateForm}
        onSearch={handleSearch}
        onCreate={list.handleCreate}
        onPageChange={list.setPage}
        onStatusChange={list.handleStatusChange}
      />
    </div>
  );
}
