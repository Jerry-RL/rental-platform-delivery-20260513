import { PageHeader } from "../components/layout/PageHeader";
import { useFlowContext } from "../context/FlowContext";
import { OrderListPanel } from "../features/panels/OrderListPanel";
import { useOrderList } from "../hooks/useOrderList";

export function OrdersPage() {
  const { booking, setMessage } = useFlowContext();
  const list = useOrderList(booking.authHeader, setMessage);

  const handleSearch = () => {
    list.setPage(1);
    if (list.page === 1) {
      void list.load();
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="我的订单" description="查看全部租车订单及状态，支持按订单号与状态筛选。" />
      <OrderListPanel
        filters={list.filters}
        loading={list.loading}
        items={list.result.items}
        total={list.result.total}
        page={list.page}
        pageSize={list.pageSize}
        selected={list.selected}
        onFiltersChange={list.setFilters}
        onSearch={handleSearch}
        onPageChange={list.setPage}
        onSelect={list.setSelected}
      />
    </div>
  );
}
