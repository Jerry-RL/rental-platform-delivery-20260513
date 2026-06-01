import {
  formatMoney,
  maintenanceOrderStatusLabel,
  maintenanceOrderTypeLabel,
  type MaintenanceOrder
} from "@rental-preview/shared";
import { AdminCrudPanel } from "../../components/shared/AdminCrudPanel";
import { maintenanceCrudFields } from "../../lib/crud-fields";
import { Badge } from "../../components/ui/badge";

export function VehiclesMaintenanceTab() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">维保工单 FR-VEH-006 · CRUD /api/v1/admin/maintenance-orders</p>
      <AdminCrudPanel<MaintenanceOrder>
        resource="maintenance-orders"
        listPath="/api/v1/admin/maintenance-orders"
        initialFilters={{ plateNumber: "", orderType: "", status: "" }}
        filterFields={[
          { key: "plateNumber", label: "车牌", type: "text" },
          {
            key: "orderType",
            label: "类型",
            type: "select",
            options: [
              { value: "ROUTINE", label: "保养" },
              { value: "REPAIR", label: "维修" }
            ]
          },
          {
            key: "status",
            label: "状态",
            type: "select",
            options: [
              { value: "SCHEDULED", label: "已排期" },
              { value: "IN_PROGRESS", label: "进行中" },
              { value: "COMPLETED", label: "已完成" }
            ]
          }
        ]}
        formFields={maintenanceCrudFields}
        batchActions={[{ label: "批量完成", patch: { status: "COMPLETED" } }]}
        columns={[
          { key: "no", header: "工单号", render: (r) => r.workOrderNo },
          { key: "plate", header: "车牌", render: (r) => r.plateNumber },
          { key: "type", header: "类型", render: (r) => maintenanceOrderTypeLabel[r.orderType] },
          { key: "title", header: "事项", render: (r) => r.title },
          {
            key: "status",
            header: "状态",
            render: (r) => (
              <Badge
                variant={
                  r.status === "IN_PROGRESS" ? "warning" : r.status === "COMPLETED" ? "success" : "secondary"
                }
              >
                {maintenanceOrderStatusLabel[r.status]}
              </Badge>
            )
          },
          { key: "cost", header: "费用", render: (r) => formatMoney(r.actualCost ?? r.estimatedCost) }
        ]}
      />
    </div>
  );
}
