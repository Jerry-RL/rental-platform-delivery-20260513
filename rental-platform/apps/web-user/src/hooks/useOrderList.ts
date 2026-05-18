import { useCallback, useEffect, useState } from "react";
import { listMyOrders } from "../services/userService";
import type { Order, PaginatedResult } from "../features/types";

type Filters = {
  status: string;
  orderNo: string;
};

type SetMessage = (message: string) => void;

export function useOrderList(authHeader: HeadersInit, setMessage: SetMessage) {
  const [filters, setFilters] = useState<Filters>({ status: "", orderNo: "" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaginatedResult<Order>>({ items: [], total: 0, page: 1, pageSize: 10 });
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await listMyOrders(
      {
        status: filters.status || undefined,
        orderNo: filters.orderNo || undefined,
        page,
        pageSize
      },
      authHeader
    );
    setLoading(false);
    if (!response.ok || !response.data) {
      setMessage(response.error ?? "加载订单失败");
      return;
    }
    setResult(response.data);
    setMessage(`已加载 ${response.data.total} 条订单`);
  }, [authHeader, filters, page, pageSize, setMessage]);

  useEffect(() => {
    void load();
  }, [page, load]);

  return {
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    loading,
    result,
    selected,
    setSelected,
    load
  };
}
