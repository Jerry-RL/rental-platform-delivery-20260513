import { useCallback, useState } from "react";
import { api } from "@rental-preview/shared";

export const useAdminCrud = (resource: string) => {
  const base = `/api/v1/admin/${resource}`;
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const wrap = useCallback(async <T>(fn: () => Promise<{ ok: boolean; error: string | null; data: T | null }>, okMsg: string) => {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.ok) {
      setMessage(okMsg);
      return true;
    }
    setMessage(res.error ?? "操作失败");
    return false;
  }, []);

  return {
    message,
    busy,
    clearMessage: () => setMessage(""),
    create: (body: Record<string, unknown>) =>
      wrap(() => api.post(`${base}`, body), "创建成功"),
    update: (id: string, body: Record<string, unknown>) =>
      wrap(() => api.put(`${base}/${id}`, body), "更新成功"),
    remove: (id: string) => wrap(() => api.delete(`${base}/${id}`), "删除成功"),
    batchDelete: (ids: string[]) =>
      wrap(() => api.post(`${base}/batch-delete`, { ids }), `已删除 ${ids.length} 条`),
    batchUpdate: (ids: string[], patch: Record<string, unknown>) =>
      wrap(() => api.post(`${base}/batch-update`, { ids, patch }), `已更新 ${ids.length} 条`)
  };
};
