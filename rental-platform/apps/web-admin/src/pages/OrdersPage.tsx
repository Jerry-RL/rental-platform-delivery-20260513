import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { OrderListPanel } from "../features/panels/OrderListPanel";
import type { Order } from "../features/types";
import { useOrderList } from "../hooks/useOrderList";

export function OrdersPage() {
  const navigate = useNavigate();
  const { core, setMessage } = useAdminFlowContext();
  const list = useOrderList(core.headers, setMessage);

  const handleSearch = () => {
    list.setPage(1);
    void list.load();
  };

  const handleSelectOrder = (order: Order) => {
    core.setOrderId(order.id);
    navigate(`/core?orderId=${encodeURIComponent(order.id)}`);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="订单管理" description="查看全平台订单，点击可进入核心流程进行支付回调、提车还车等操作。" />
      <OrderListPanel
        filters={list.filters}
        loading={list.loading}
        items={list.result.items}
        total={list.result.total}
        page={list.page}
        pageSize={list.pageSize}
        onFiltersChange={list.setFilters}
        onSearch={handleSearch}
        onPageChange={list.setPage}
        onSelectOrder={handleSelectOrder}
      />
    </div>
  );
}
