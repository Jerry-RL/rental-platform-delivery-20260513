import type { GpsSnapshot, MapPolicy } from "@rental-preview/shared";
import { Badge } from "../components/ui/badge";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { CollapsibleSection } from "../components/ui/collapsible";
import { mapPolicyCrudFields } from "../lib/crud-fields";
import { usePreviewApi } from "../hooks/usePreviewApi";

export function ExtensionsPage() {
  const gps = usePreviewApi<GpsSnapshot[]>("/api/v1/admin/gps");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">GPS 与地图</h2>
        <p className="text-sm text-muted-foreground">FR-EXT-004~006 · 地图策略 CRUD</p>
      </div>

      <CollapsibleSection title="GPS 实时位置（只读）" defaultOpen>
        <div className="space-y-2 text-sm">
          {(gps.data ?? []).slice(0, 20).map((g) => (
            <div key={g.vehicleId} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3">
              <span className="font-medium">{g.plateNumber}</span>
              <Badge variant={g.online ? "success" : "secondary"}>{g.online ? "在线" : "离线"}</Badge>
              <span className="text-muted-foreground">
                {g.provider} · {g.lat.toFixed(4)}, {g.lng.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="地图授权策略" description="CRUD /api/v1/admin/map-policies" defaultOpen>
        <AdminCrudPanel<MapPolicy>
          resource="map-policies"
          listPath="/api/v1/admin/map-policies"
          formFields={mapPolicyCrudFields}
          columns={[
            { key: "scene", header: "场景", render: (r) => r.scene },
            { key: "mode", header: "模式", render: (r) => r.mode },
            { key: "provider", header: "供应商", render: (r) => r.provider },
            {
              key: "lic",
              header: "商用授权",
              render: (r) => (r.commercialLicensed ? "已确认" : "低风险")
            }
          ]}
        />
      </CollapsibleSection>
    </div>
  );
}
