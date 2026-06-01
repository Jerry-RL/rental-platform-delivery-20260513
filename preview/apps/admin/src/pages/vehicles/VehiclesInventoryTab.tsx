import { Link } from "react-router-dom";
import { VehicleImage } from "../../components/shared/VehicleImage";
import { formatMoney, vehicleStatusLabel, type Vehicle } from "@rental-preview/shared";
import { AdminCrudPanel } from "../../components/shared/AdminCrudPanel";
import { vehicleBatchActions, vehicleCrudFields } from "../../lib/crud-fields";
import { Badge } from "../../components/ui/badge";

const vehicleFilterFields = [
  { key: "plateNumber", label: "车牌号", type: "text" as const, placeholder: "沪A / 京B" },
  {
    key: "city",
    label: "城市",
    type: "select" as const,
    options: ["上海", "北京", "广州", "深圳", "杭州", "成都"].map((c) => ({ value: c, label: c }))
  },
  {
    key: "status",
    label: "车辆状态",
    type: "select" as const,
    options: [
      { value: "AVAILABLE", label: "可用" },
      { value: "IN_USE", label: "已租出" },
      { value: "OCCUPIED", label: "已占用" },
      { value: "MAINTENANCE", label: "维修中" },
      { value: "ACCIDENT_HOLD", label: "事故停运" },
      { value: "RETIRED", label: "报废" }
    ]
  },
  {
    key: "vehicleTypeId",
    label: "车型",
    type: "select" as const,
    options: [
      { value: "ECONOMY", label: "经济型" },
      { value: "SEDAN", label: "轿车" },
      { value: "SUV", label: "SUV" },
      { value: "MPV", label: "MPV" },
      { value: "NEW_ENERGY", label: "新能源" },
      { value: "LUXURY", label: "豪华" }
    ]
  },
  {
    key: "maintenanceLevel",
    label: "保养提醒",
    type: "select" as const,
    options: [
      { value: "OVERDUE", label: "已超期" },
      { value: "DUE_SOON", label: "即将保养" },
      { value: "OK", label: "正常" }
    ]
  }
];

export function VehiclesInventoryTab() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        GET /api/v1/vehicles · 新建/编辑可上传车辆图（封面+多图）· POST /api/v1/admin/uploads/vehicle-image
      </p>
      <AdminCrudPanel<Vehicle>
        resource="vehicles"
        listPath="/api/v1/vehicles"
        initialFilters={{
          plateNumber: "",
          city: "",
          status: "",
          vehicleTypeId: "",
          maintenanceLevel: ""
        }}
        filterFields={vehicleFilterFields}
        formFields={vehicleCrudFields}
        batchActions={vehicleBatchActions}
        renderRowActions={(r) => (
          <Link
            to={`/vehicles/${r.id}/history`}
            className="rounded px-2 py-0.5 text-xs text-primary hover:bg-accent"
          >
            历史轨迹
          </Link>
        )}
        columns={[
          {
            key: "photo",
            header: "图片",
            render: (r) =>
              r.imageUrl ? (
                <VehicleImage
                  src={r.imageUrl}
                  vehicleId={r.id}
                  vehicleTypeId={r.vehicleTypeId}
                  alt={r.plateNumber}
                  className="h-10 w-14 rounded border border-border"
                />
              ) : (
                <span className="text-xs text-muted-foreground">未上传</span>
              )
          },
          {
            key: "plate",
            header: "车牌",
            render: (r) => (
              <Link
                to={`/vehicles/${r.id}/history`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {r.plateNumber}
              </Link>
            )
          },
          { key: "model", header: "车型", render: (r) => `${r.brand} ${r.model}` },
          { key: "city", header: "城市", render: (r) => r.city },
          {
            key: "status",
            header: "状态",
            render: (r) => (
              <Badge variant={r.status === "AVAILABLE" ? "success" : "secondary"}>
                {vehicleStatusLabel[r.status]}
              </Badge>
            )
          },
          { key: "mileage", header: "里程(km)", render: (r) => r.mileage.toLocaleString() },
          { key: "price", header: "日租", render: (r) => formatMoney(r.dailyPrice) }
        ]}
      />
    </div>
  );
}
