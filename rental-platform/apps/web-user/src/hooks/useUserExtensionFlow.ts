import { useState } from "react";
import { getGpsRealtime, getGpsTrack, getLatestViolationTask, getReminderSummary } from "../services/userService";
import type { ReminderSummary, ViolationTaskSummary } from "../features/types";

type SetMessage = (message: string) => void;

export function useUserExtensionFlow(authHeader: HeadersInit, setMessage: SetMessage) {
  const [reminderSummary, setReminderSummary] = useState<ReminderSummary | null>(null);
  const [startLocationInput, setStartLocationInput] = useState("上海虹桥火车站");
  const [selectedStartLocation, setSelectedStartLocation] = useState<{ name: string; lng: number; lat: number } | null>(null);
  const [gpsVehicleId, setGpsVehicleId] = useState("vehicle-sh-001");
  const [gpsRealtimeJson, setGpsRealtimeJson] = useState("{}");
  const [gpsTrackJson, setGpsTrackJson] = useState("[]");
  const [latestViolationTask, setLatestViolationTask] = useState<ViolationTaskSummary | null>(null);

  const handleLoadReminderSummary = async () => {
    const result = await getReminderSummary(authHeader);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "读取提醒摘要失败");
      return;
    }
    setReminderSummary(result.data);
    setMessage(result.isMock ? "提醒摘要读取成功（Mock模式）" : "提醒摘要读取成功（真实接口）");
  };

  const handleSelectStartLocation = () => {
    if (!startLocationInput.trim()) {
      setMessage("请输入起点位置关键字");
      return;
    }
    setSelectedStartLocation({
      name: startLocationInput,
      lng: 121.4737,
      lat: 31.2304
    });
    setMessage("起点位置已选中（演示模式）");
  };

  const handleLoadGpsRealtime = async () => {
    if (!gpsVehicleId.trim()) {
      setMessage("请输入车辆ID");
      return;
    }
    const result = await getGpsRealtime(gpsVehicleId, authHeader);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "读取GPS实时位置失败");
      return;
    }
    setGpsRealtimeJson(JSON.stringify(result.data, null, 2));
    setMessage(result.isMock ? "GPS实时位置读取成功（Mock模式）" : "GPS实时位置读取成功（真实接口）");
  };

  const handleLoadGpsTrack = async () => {
    if (!gpsVehicleId.trim()) {
      setMessage("请输入车辆ID");
      return;
    }
    const result = await getGpsTrack(gpsVehicleId, authHeader);
    if (!result.ok) {
      setMessage(result.error ?? "读取GPS轨迹失败");
      return;
    }
    setGpsTrackJson(JSON.stringify(result.data ?? [], null, 2));
    setMessage(result.isMock ? "GPS轨迹读取成功（Mock模式）" : "GPS轨迹读取成功（真实接口）");
  };

  const handleLoadLatestViolationTask = async () => {
    const result = await getLatestViolationTask(authHeader);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "读取违章任务失败");
      return;
    }
    setLatestViolationTask(result.data);
    setMessage(result.isMock ? "违章任务状态读取成功（Mock模式）" : "违章任务状态读取成功（真实接口）");
  };

  return {
    reminderSummary,
    startLocationInput,
    selectedStartLocation,
    gpsVehicleId,
    gpsRealtimeJson,
    gpsTrackJson,
    latestViolationTask,
    setStartLocationInput,
    setGpsVehicleId,
    handleLoadReminderSummary,
    handleSelectStartLocation,
    handleLoadGpsRealtime,
    handleLoadGpsTrack,
    handleLoadLatestViolationTask
  };
}
