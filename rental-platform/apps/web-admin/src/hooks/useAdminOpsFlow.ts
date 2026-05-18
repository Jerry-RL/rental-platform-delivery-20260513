import { useState } from "react";
import {
  createViolationTask,
  getGpsSnapshot,
  getIntegrationCosts,
  getReminderLogs,
  getViolationQuota,
  saveMapPolicy,
  saveReminderRule,
  saveViolationQuota
} from "../services/adminService";
import type { IntegrationCost, MapPolicy, ReminderRule, ViolationQuota, ViolationTask } from "../features/types";

type SetMessage = (message: string) => void;

export function useAdminOpsFlow(headers: HeadersInit, setMessage: SetMessage) {
  const [violationVehiclesText, setViolationVehiclesText] = useState("沪A12345\n沪B88990\n沪C55661");
  const [violationTasks, setViolationTasks] = useState<ViolationTask[]>([]);
  const [violationResultJson, setViolationResultJson] = useState("{}");
  const [quota, setQuota] = useState<ViolationQuota>({
    month: "2026-05",
    limit: 2,
    used: 0,
    overageStrategy: "DENY"
  });
  const [costMonth, setCostMonth] = useState("2026-05");
  const [costRecords, setCostRecords] = useState<IntegrationCost[]>([]);
  const [reminderRule, setReminderRule] = useState<ReminderRule>({
    insuranceEnabled: true,
    annualReviewEnabled: true,
    remindBeforeDays: 30
  });
  const [reminderLogsJson, setReminderLogsJson] = useState("[]");
  const [mapPolicy, setMapPolicy] = useState<MapPolicy>({
    mapMode: "GPS_VENDOR_PROXY",
    authStatus: "UNCONFIRMED"
  });
  const [gpsVehicleId, setGpsVehicleId] = useState("vehicle-sh-001");
  const [gpsSnapshotJson, setGpsSnapshotJson] = useState("{}");

  const handleCreateViolationTask = async () => {
    const vehicleIds = violationVehiclesText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (vehicleIds.length === 0) {
      setMessage("请至少输入1个车牌或车辆ID");
      return;
    }
    const result = await createViolationTask(vehicleIds, headers);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "创建违章任务失败");
      return;
    }
    setViolationTasks((prev) => [result.data!, ...prev]);
    setViolationResultJson(JSON.stringify(result.data, null, 2));
    setMessage(result.isMock ? "违章任务创建成功（Mock模式）" : "违章任务创建成功（真实接口）");
  };

  const handleLoadQuota = async () => {
    const result = await getViolationQuota(quota.month, headers, quota);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "读取配额失败");
      return;
    }
    setQuota(result.data);
    setMessage(result.isMock ? "配额读取成功（Mock模式）" : "配额读取成功（真实接口）");
  };

  const handleSaveQuota = async () => {
    const result = await saveViolationQuota(quota, headers);
    setMessage(result.ok ? (result.isMock ? "配额保存成功（Mock模式）" : "配额保存成功（真实接口）") : (result.error ?? "保存配额失败"));
  };

  const handleLoadCosts = async () => {
    const result = await getIntegrationCosts(costMonth, headers);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "读取成本台账失败");
      return;
    }
    setCostRecords(result.data);
    setMessage(result.isMock ? "成本台账读取成功（Mock模式）" : "成本台账读取成功（真实接口）");
  };

  const handleSaveReminderRule = async () => {
    const result = await saveReminderRule(reminderRule, headers);
    setMessage(result.ok ? (result.isMock ? "提醒规则保存成功（Mock模式）" : "提醒规则保存成功（真实接口）") : (result.error ?? "保存提醒规则失败"));
  };

  const handleLoadReminderLogs = async () => {
    const result = await getReminderLogs(headers);
    if (!result.ok) {
      setMessage(result.error ?? "读取提醒日志失败");
      return;
    }
    setReminderLogsJson(JSON.stringify(result.data ?? [], null, 2));
    setMessage(result.isMock ? "提醒日志读取成功（Mock模式）" : "提醒日志读取成功（真实接口）");
  };

  const handleSaveMapPolicy = async () => {
    const result = await saveMapPolicy(mapPolicy, headers);
    setMessage(result.ok ? (result.isMock ? "地图策略保存成功（Mock模式）" : "地图策略保存成功（真实接口）") : (result.error ?? "保存地图策略失败"));
  };

  const handleQueryGpsSnapshot = async () => {
    if (!gpsVehicleId.trim()) {
      setMessage("请输入车辆ID");
      return;
    }
    const result = await getGpsSnapshot(gpsVehicleId, headers);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "读取GPS快照失败");
      return;
    }
    setGpsSnapshotJson(JSON.stringify(result.data, null, 2));
    setMessage(result.isMock ? "GPS快照读取成功（Mock模式）" : "GPS快照读取成功（真实接口）");
  };

  return {
    violationVehiclesText,
    violationTasks,
    violationResultJson,
    quota,
    costMonth,
    costRecords,
    reminderRule,
    reminderLogsJson,
    mapPolicy,
    gpsVehicleId,
    gpsSnapshotJson,
    setViolationVehiclesText,
    setQuota,
    setCostMonth,
    setReminderRule,
    setMapPolicy,
    setGpsVehicleId,
    handleCreateViolationTask,
    handleLoadQuota,
    handleSaveQuota,
    handleLoadCosts,
    handleSaveReminderRule,
    handleLoadReminderLogs,
    handleSaveMapPolicy,
    handleQueryGpsSnapshot
  };
}
