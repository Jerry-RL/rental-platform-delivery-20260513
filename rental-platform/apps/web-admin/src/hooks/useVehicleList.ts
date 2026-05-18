import { useCallback, useEffect, useState } from "react";
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  updateVehicle,
  updateVehicleStatus
} from "../services/adminService";
import type { PaginatedResult, Vehicle, VehicleForm } from "../features/types";
import { emptyVehicleForm, formToPayload, vehicleToForm } from "../lib/vehicleForm";

type Filters = {
  city: string;
  vehicleTypeId: string;
  status: string;
  keyword: string;
  reminder: string;
};

type SetMessage = (message: string) => void;

export function useVehicleList(headers: HeadersInit, setMessage: SetMessage) {
  const [filters, setFilters] = useState<Filters>({ city: "", vehicleTypeId: "", status: "", keyword: "", reminder: "" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaginatedResult<Vehicle>>({ items: [], total: 0, page: 1, pageSize: 10 });
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyVehicleForm());

  const load = useCallback(async () => {
    setLoading(true);
    const response = await listVehicles(
      {
        city: filters.city || undefined,
        vehicleTypeId: filters.vehicleTypeId || undefined,
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
      setMessage(response.error ?? "加载车辆列表失败");
      return;
    }
    setResult(response.data);
    setMessage(`已加载 ${response.data.total} 台车辆`);
  }, [filters, headers, page, pageSize, setMessage]);

  useEffect(() => {
    void load();
  }, [page, load]);

  const openCreate = () => {
    setForm(emptyVehicleForm());
    setEditingId(null);
    setFormMode("create");
  };

  const openEdit = (vehicle: Vehicle) => {
    setForm(vehicleToForm(vehicle));
    setEditingId(vehicle.id);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingId(null);
    setForm(emptyVehicleForm());
  };

  const handleSave = async () => {
    if (!form.plateNumber.trim() || !form.vehicleTypeId.trim() || !form.city.trim()) {
      setMessage("请填写车牌、车型与城市");
      return;
    }
    const payload = formToPayload(form);
    const response =
      formMode === "edit" && editingId
        ? await updateVehicle(editingId, payload, headers)
        : await createVehicle(payload, headers);

    if (!response.ok) {
      setMessage(response.error ?? "保存车辆失败");
      return;
    }
    setMessage(formMode === "edit" ? "车辆已更新" : "车辆已新增");
    closeForm();
    void load();
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`确定删除车辆 ${vehicle.plateNumber}？`)) {
      return;
    }
    const response = await deleteVehicle(vehicle.id, headers);
    if (!response.ok) {
      setMessage(response.error ?? "删除失败");
      return;
    }
    setMessage("车辆已删除");
    if (editingId === vehicle.id) {
      closeForm();
    }
    void load();
  };

  const handleStatusChange = async (vehicleId: string, status: Vehicle["status"]) => {
    const response = await updateVehicleStatus(vehicleId, status, headers);
    if (!response.ok) {
      setMessage(response.error ?? "更新状态失败");
      return;
    }
    setMessage("车辆状态已更新");
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
    handleDelete,
    handleStatusChange
  };
}
