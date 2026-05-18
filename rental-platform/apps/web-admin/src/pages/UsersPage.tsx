import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { EnterpriseUserListPanel } from "../features/panels/EnterpriseUserListPanel";
import { IndividualUserListPanel } from "../features/panels/IndividualUserListPanel";
import { useEnterpriseUserList } from "../hooks/useEnterpriseUserList";
import { useIndividualUserList } from "../hooks/useIndividualUserList";
import { cn } from "../lib/utils";

type UserTab = "individual" | "enterprise";

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") === "enterprise" ? "enterprise" : "individual") as UserTab;
  const { core, setMessage } = useAdminFlowContext();
  const individual = useIndividualUserList(core.headers, setMessage);
  const enterprise = useEnterpriseUserList(core.headers, setMessage);

  const setTab = (next: UserTab) => {
    setSearchParams(next === "enterprise" ? { tab: "enterprise" } : {});
  };

  const handleIndividualSearch = () => {
    individual.setPage(1);
    if (individual.page === 1) void individual.load();
  };

  const handleEnterpriseSearch = () => {
    enterprise.setPage(1);
    if (enterprise.page === 1) void enterprise.load();
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="用户管理" description="普通用户（C 端个人）与企业用户（B/G 账务主体）分栏管理。" />

      <div className="flex gap-2 rounded-lg border border-border bg-muted/30 p-1">
        <Button
          type="button"
          variant={tab === "individual" ? "default" : "outline"}
          size="sm"
          className={cn("flex-1", tab === "individual" && "shadow-sm")}
          onClick={() => setTab("individual")}
        >
          普通用户
        </Button>
        <Button
          type="button"
          variant={tab === "enterprise" ? "default" : "outline"}
          size="sm"
          className={cn("flex-1", tab === "enterprise" && "shadow-sm")}
          onClick={() => setTab("enterprise")}
        >
          企业用户
        </Button>
      </div>

      {tab === "individual" ? (
        <IndividualUserListPanel
          filters={individual.filters}
          createForm={individual.createForm}
          loading={individual.loading}
          items={individual.result.items}
          total={individual.result.total}
          page={individual.page}
          pageSize={individual.pageSize}
          onFiltersChange={individual.setFilters}
          onCreateFormChange={individual.setCreateForm}
          onSearch={handleIndividualSearch}
          onCreate={individual.handleCreate}
          onPageChange={individual.setPage}
          onStatusChange={individual.handleStatusChange}
        />
      ) : (
        <EnterpriseUserListPanel
          filters={enterprise.filters}
          createForm={enterprise.createForm}
          loading={enterprise.loading}
          items={enterprise.result.items}
          total={enterprise.result.total}
          page={enterprise.page}
          pageSize={enterprise.pageSize}
          onFiltersChange={enterprise.setFilters}
          onCreateFormChange={enterprise.setCreateForm}
          onSearch={handleEnterpriseSearch}
          onCreate={enterprise.handleCreate}
          onPageChange={enterprise.setPage}
          onStatusChange={enterprise.handleStatusChange}
        />
      )}
    </div>
  );
}
