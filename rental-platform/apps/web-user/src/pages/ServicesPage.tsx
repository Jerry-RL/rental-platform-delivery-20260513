import { PageHeader } from "../components/layout/PageHeader";
import { useFlowContext } from "../context/FlowContext";
import { ExtensionSummaryPanel } from "../features/panels/ExtensionSummaryPanel";
import { LocationGpsPanel } from "../features/panels/LocationGpsPanel";

export function ServicesPage() {
  const { extension } = useFlowContext();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="扩展服务" description="到期提醒、违章任务、上车定位与 GPS 实时/轨迹查询。" />
      <div className="grid gap-6 xl:grid-cols-2">
        <ExtensionSummaryPanel
          reminderSummary={extension.reminderSummary}
          latestViolationTask={extension.latestViolationTask}
          onLoadReminderSummary={extension.handleLoadReminderSummary}
          onLoadLatestViolationTask={extension.handleLoadLatestViolationTask}
        />
        <LocationGpsPanel
          startLocationInput={extension.startLocationInput}
          selectedStartLocation={extension.selectedStartLocation}
          gpsVehicleId={extension.gpsVehicleId}
          gpsRealtimeJson={extension.gpsRealtimeJson}
          gpsTrackJson={extension.gpsTrackJson}
          onStartLocationInputChange={extension.setStartLocationInput}
          onSelectStartLocation={extension.handleSelectStartLocation}
          onGpsVehicleIdChange={extension.setGpsVehicleId}
          onLoadGpsRealtime={extension.handleLoadGpsRealtime}
          onLoadGpsTrack={extension.handleLoadGpsTrack}
        />
      </div>
    </div>
  );
}
