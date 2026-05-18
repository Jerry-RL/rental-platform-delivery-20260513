import { useCallback, useEffect, useState } from "react";
import { createPersonnel, listPersonnel, updatePersonnelStatus } from "../services/adminService";
import type { PaginatedResult, Personnel } from "../features/types";

type Filters = { role: string; status: string; department: string; keyword: string };
type CreateForm = {
  name: string;
  phone: string;
  email: string;
  role: Personnel["role"];
  department: string;
};

type SetMessage = (message: string) => void;

const emptyForm: CreateForm = {
  name: "",
  phone: "",
  email: "",
  role: "OPERATOR",
  department: "运营部"
};

export function usePersonnelList(headers: HeadersInit, setMessage: SetMessage) {
  const [filters, setFilters] = useState<Filters>({ role: "", status: "", department: "", keyword: "" });
  const [createForm, setCreateForm] = useState<CreateForm>(emptyForm);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaginatedResult<Personnel>>({ items: [], total: 0, page: 1, pageSize: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await listPersonnel(
      {
        role: filters.role || undefined,
        status: filters.status || undefined,
        department: filters.department || undefined,
        keyword: filters.keyword || undefined,
        page,
        pageSize
      },
      headers
    );
    setLoading(false);
    if (!response.ok || !response.data) {
      setMessage(response.error ?? "加载人员列表失败");
      return;
    }
    setResult(response.data);
    setMessage(`已加载 ${response.data.total} 名人员`);
  }, [filters, headers, page, pageSize, setMessage]);

  useEffect(() => {
    void load();
  }, [page, load]);

  const handleCreate = async () => {
    if (!createForm.name || !createForm.phone || !createForm.department) {
      setMessage("请填写姓名、手机号与部门");
      return;
    }
    const response = await createPersonnel(
      { ...createForm, email: createForm.email || undefined, status: "ACTIVE" },
      headers
    );
    if (!response.ok) {
      setMessage(response.error ?? "新增人员失败");
      return;
    }
    setMessage("人员已新增");
    setCreateForm(emptyForm);
    void load();
  };

  const handleStatusChange = async (personnelId: string, status: Personnel["status"]) => {
    const response = await updatePersonnelStatus(personnelId, status, headers);
    if (!response.ok) {
      setMessage(response.error ?? "更新状态失败");
      return;
    }
    setMessage("人员状态已更新");
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
