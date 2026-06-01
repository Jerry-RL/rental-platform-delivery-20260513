import { useCallback, useEffect, useState } from "react";
import { api, type ApiResult, type PageResult } from "@rental-preview/shared";
import { buildQueryPath } from "../lib/query";

export const useFilteredList = <T>(basePath: string, initialFilters: Record<string, string> = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const defaultPageSize = basePath.includes("/vehicles") ? "200" : "50";
  const [path, setPath] = useState(buildQueryPath(basePath, { ...initialFilters, pageSize: defaultPageSize }));
  const [result, setResult] = useState<ApiResult<PageResult<T>> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async (p: string) => {
    setLoading(true);
    const res = await api.get<PageResult<T>>(p);
    setResult(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchList(path);
  }, [path, fetchList]);

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const search = () => {
    const pageSize = basePath.includes("/vehicles") ? "200" : "50";
    setPath(buildQueryPath(basePath, { ...filters, pageSize }));
  };

  const reset = () => {
    setFilters(initialFilters);
    const pageSize = basePath.includes("/vehicles") ? "200" : "50";
    setPath(buildQueryPath(basePath, { ...initialFilters, pageSize }));
  };

  return {
    items: result?.data?.items ?? [],
    total: result?.data?.total ?? 0,
    loading,
    filters,
    setFilter,
    search,
    reset,
    reload: () => void fetchList(path)
  };
};
