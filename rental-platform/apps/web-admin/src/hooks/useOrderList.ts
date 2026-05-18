import { useCallback, useEffect, useState } from "react";
import { listOrders } from "../services/adminService";
import type { Order, PaginatedResult } from "../features/types";

type Filters = {
  status: string;
  orderNo: string;
  userId: string;
};

type SetMessage = (message: string) => void;

export function useOrderList(headers: HeadersInit, setMessage: SetMessage) {
  const [filters, setFilters] = useState<Filters>({ status: "", orderNo: "", userId: "" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaginatedResult<Order>>({ items: [], total: 0, page: 1, pageSize: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await listOrders(
      {
        status: filters.status || undefined,
        orderNo: filters.orderNo || undefined,
        userId: filters.userId || undefined,
        page,
        pageSize
      },
      headers
    );
    setLoading(false);
    if (!response.ok || !response.data) {
      setMessage(response.error ?? "加载订单列表失败");
      return;
    }
    setResult(response.data);
    setMessage(`已加载 ${response.data.total} 条订单`);
  }, [filters, headers, page, pageSize, setMessage]);

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
    load
  };
}
