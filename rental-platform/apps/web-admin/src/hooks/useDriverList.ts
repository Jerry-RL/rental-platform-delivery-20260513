import { useCallback, useEffect, useState } from "react";
import { createDriver, listDrivers, updateDriver, updateDriverStatus } from "../services/adminService";
import type { Driver, PaginatedResult } from "../features/types";
import { driverToForm, emptyDriverForm, formToPayload } from "../lib/driverForm";

type Filters = { city: string; status: string; keyword: string; reminder: string };

type SetMessage = (message: string) => void;

export function useDriverList(headers: HeadersInit, setMessage: SetMessage) {
  const [filters, setFilters] = useState<Filters>({ city: "", status: "", keyword: "", reminder: "" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaginatedResult<Driver>>({ items: [], total: 0, page: 1, pageSize: 10 });
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyDriverForm());

  const load = useCallback(async () => {
    setLoading(true);
    const response = await listDrivers(
      {
        city: filters.city || undefined,
        status: filters.status || undefined,
        keyword: filters.keyword || undefined,
        reminder: filters.reminder || undefined,
        page,
        pageSize
      },
      headers
    );
    setLoading(false);
    if (!response.ok || !response.data) {
      setMessage(response.error ?? "加载司机列表失败");
      return;
    }
    setResult(response.data);
    setMessage(`已加载 ${response.data.total} 名司机`);
  }, [filters, headers, page, pageSize, setMessage]);

  useEffect(() => {
    void load();
  }, [page, load]);

  const openCreate = () => {
    setForm(emptyDriverForm());
    setEditingId(null);
    setFormMode("create");
  };

  const openEdit = (driver: Driver) => {
    setForm(driverToForm(driver));
    setEditingId(driver.id);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingId(null);
    setForm(emptyDriverForm());
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.licenseNo.trim() || !form.city.trim()) {
      setMessage("请填写姓名、手机号、驾照号与城市");
      return;
    }
    const payload = formToPayload(form);
    const response =
      formMode === "edit" && editingId
        ? await updateDriver(editingId, payload, headers)
        : await createDriver(payload, headers);

    if (!response.ok) {
      setMessage(response.error ?? "保存司机失败");
      return;
    }
    setMessage(formMode === "edit" ? "司机已更新" : "司机已新增");
    closeForm();
    void load();
  };

  const handleStatusChange = async (driverId: string, status: Driver["status"]) => {
    const response = await updateDriverStatus(driverId, status, headers);
    if (!response.ok) {
      setMessage(response.error ?? "更新状态失败");
      return;
    }
    setMessage("司机状态已更新");
    void load();
  };

  return {
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    loading,
    result,
    load,
    formMode,
    form,
    setForm,
    openCreate,
    openEdit,
    closeForm,
    handleSave,
    handleStatusChange
  };
}
