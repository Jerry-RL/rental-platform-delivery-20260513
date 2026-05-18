import { useCallback, useEffect, useState } from "react";
import { createEnterpriseUser, listEnterpriseUsers, updateEnterpriseUserStatus } from "../services/adminService";
import type { EnterpriseAccount, PaginatedResult } from "../features/types";

type Filters = { keyword: string; status: string; accountType: string };
type CreateForm = {
  orgName: string;
  accountType: EnterpriseAccount["accountType"];
  contactName: string;
  contactPhone: string;
  creditLimit: string;
};

type SetMessage = (message: string) => void;

const emptyForm: CreateForm = {
  orgName: "",
  accountType: "B",
  contactName: "",
  contactPhone: "",
  creditLimit: "100000"
};

export function useEnterpriseUserList(headers: HeadersInit, setMessage: SetMessage) {
  const [filters, setFilters] = useState<Filters>({ keyword: "", status: "", accountType: "" });
  const [createForm, setCreateForm] = useState<CreateForm>(emptyForm);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaginatedResult<EnterpriseAccount>>({ items: [], total: 0, page: 1, pageSize: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await listEnterpriseUsers(
      {
        keyword: filters.keyword || undefined,
        status: filters.status || undefined,
        accountType: filters.accountType || undefined,
        page,
        pageSize
      },
      headers
    );
    setLoading(false);
    if (!response.ok || !response.data) {
      setMessage(response.error ?? "加载企业用户失败");
      return;
    }
    setResult(response.data);
    setMessage(`已加载 ${response.data.total} 家企业账户`);
  }, [filters, headers, page, pageSize, setMessage]);

  useEffect(() => {
    void load();
  }, [page, load]);

  const handleCreate = async () => {
    if (!createForm.orgName || !createForm.contactName || !createForm.contactPhone) {
      setMessage("请填写企业名称、联系人及电话");
      return;
    }
    const response = await createEnterpriseUser(
      {
        orgName: createForm.orgName,
        accountType: createForm.accountType,
        contactName: createForm.contactName,
        contactPhone: createForm.contactPhone,
        creditLimit: Number(createForm.creditLimit) || 0
      },
      headers
    );
    if (!response.ok) {
      setMessage(response.error ?? "新增企业账户失败");
      return;
    }
    setMessage("企业账户已新增");
    setCreateForm(emptyForm);
    void load();
  };

  const handleStatusChange = async (accountId: string, status: EnterpriseAccount["status"]) => {
    const response = await updateEnterpriseUserStatus(accountId, status, headers);
    if (!response.ok) {
      setMessage(response.error ?? "更新状态失败");
      return;
    }
    setMessage("企业账户状态已更新");
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
