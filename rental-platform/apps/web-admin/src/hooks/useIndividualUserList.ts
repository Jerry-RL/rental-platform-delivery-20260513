import { useCallback, useEffect, useState } from "react";
import { createIndividualUser, listIndividualUsers, updateIndividualUserStatus } from "../services/adminService";
import type { IndividualUser, PaginatedResult } from "../features/types";

type Filters = { keyword: string; status: string; licenseValid: string };
type CreateForm = { phone: string; password: string; realName: string; licenseValid: boolean };

type SetMessage = (message: string) => void;

const emptyForm: CreateForm = { phone: "", password: "", realName: "", licenseValid: true };

export function useIndividualUserList(headers: HeadersInit, setMessage: SetMessage) {
  const [filters, setFilters] = useState<Filters>({ keyword: "", status: "", licenseValid: "" });
  const [createForm, setCreateForm] = useState<CreateForm>(emptyForm);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaginatedResult<IndividualUser>>({ items: [], total: 0, page: 1, pageSize: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await listIndividualUsers(
      {
        keyword: filters.keyword || undefined,
        status: filters.status || undefined,
        licenseValid: filters.licenseValid || undefined,
        page,
        pageSize
      },
      headers
    );
    setLoading(false);
    if (!response.ok || !response.data) {
      setMessage(response.error ?? "加载普通用户失败");
      return;
    }
    setResult(response.data);
    setMessage(`已加载 ${response.data.total} 名普通用户`);
  }, [filters, headers, page, pageSize, setMessage]);

  useEffect(() => {
    void load();
  }, [page, load]);

  const handleCreate = async () => {
    if (!createForm.phone || !createForm.password || !createForm.realName) {
      setMessage("请填写手机号、密码与姓名");
      return;
    }
    const response = await createIndividualUser(createForm, headers);
    if (!response.ok) {
      setMessage(response.error ?? "新增用户失败");
      return;
    }
    setMessage("普通用户已新增");
    setCreateForm(emptyForm);
    void load();
  };

  const handleStatusChange = async (userId: string, status: IndividualUser["status"]) => {
    const response = await updateIndividualUserStatus(userId, status, headers);
    if (!response.ok) {
      setMessage(response.error ?? "更新状态失败");
      return;
    }
    setMessage("用户状态已更新");
    void load();
  };

  return {
    filters,
    setFilters,
    createForm,
    setCreateForm,
    page,
    setPage,
    pageSize,
    loading,
    result,
    load,
    handleCreate,
    handleStatusChange
  };
}
