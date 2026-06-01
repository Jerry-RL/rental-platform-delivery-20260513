import { useCallback, useEffect, useState } from "react";
import { api, type ApiResult } from "@rental-preview/shared";

export const usePreviewApi = <T>(path: string, deps: unknown[] = []) => {
  const [result, setResult] = useState<ApiResult<T> | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await api.get<T>(path);
    setResult(res);
    setLoading(false);
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload, ...deps]);

  return { data: result?.data ?? null, loading, error: result?.error, reload };
};
