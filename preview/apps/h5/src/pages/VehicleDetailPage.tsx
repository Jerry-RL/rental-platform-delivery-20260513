import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  api,
  buildVehicleDetail,
  formatMoney,
  formatVehicleHistoryEvent,
  type Store,
  type Vehicle,
  type VehicleHistoryTimeline
} from "@rental-preview/shared";
import { DetailLine } from "../components/DetailLine";
import { SectionCard } from "../components/SectionCard";
import { VehicleImage } from "../components/VehicleImage";
import { cn } from "../lib/utils";

export function VehicleDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get("from");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [history, setHistory] = useState<VehicleHistoryTimeline | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [vRes, sRes, hRes] = await Promise.all([
      api.get<Vehicle>(`/api/v1/vehicles/${id}`),
      api.get<Store[]>("/api/v1/admin/stores"),
      api.get<VehicleHistoryTimeline>(`/api/v1/vehicles/${id}/history`)
    ]);
    setLoading(false);
    if (vRes.ok && vRes.data) setVehicle(vRes.data);
    if (sRes.ok && sRes.data && vRes.data) {
      setStore(sRes.data.find((x) => x.id === vRes.data!.storeId) ?? null);
    }
    if (hRes.ok && hRes.data) setHistory(hRes.data);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBack = () => {
    if (from === "booking") navigate(-1);
    else if (from === "order") navigate(-1);
    else navigate("/home");
  };

  const handleBook = () => {
    if (!vehicle) return;
    navigate(
      `/booking?vehicleId=${vehicle.id}&vehicleTypeId=${vehicle.vehicleTypeId}&brand=${encodeURIComponent(vehicle.brand)}&model=${encodeURIComponent(vehicle.model)}&city=${encodeURIComponent(vehicle.city)}`
    );
  };

  if (loading) return <p className="p-4 text-sm text-muted-foreground">加载中…</p>;
  if (!vehicle) {
    return (
      <div className="space-y-4 p-4">
        <button type="button" className="text-sm text-primary" onClick={handleBack}>
          ← 返回
        </button>
        <p className="text-sm text-muted-foreground">车辆不存在或已下架</p>
      </div>
    );
  }

  const detail = buildVehicleDetail(vehicle, store);
  const images = vehicle.imageUrls?.length ? vehicle.imageUrls : [vehicle.imageUrl];
  const recentEvents = history?.events.slice(0, 5) ?? [];

  return (
    <div className="space-y-4 p-4 pb-8">
      <button type="button" className="text-sm text-primary" onClick={handleBack}>
        ← 返回
      </button>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <VehicleImage
          src={vehicle.imageUrl}
          vehicleId={vehicle.id}
          vehicleTypeId={vehicle.vehicleTypeId}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="aspect-[16/10] w-full object-cover"
        />
        {images.length > 1 && (
          <div className="flex gap-1 overflow-x-auto border-t border-border p-2">
            {images.slice(0, 4).map((url, i) => (
              <VehicleImage
                key={i}
                src={url}
                vehicleId={vehicle.id}
                vehicleTypeId={vehicle.vehicleTypeId}
                className="h-14 w-20 shrink-0 rounded-md"
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-xl font-semibold">
          {vehicle.brand} {vehicle.model}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {detail.typeLabel} · {vehicle.plateNumber} · {vehicle.city}
        </p>
        <p className="mt-2 text-lg font-bold text-primary">
          {formatMoney(vehicle.dailyPrice)}
          <span className="text-sm font-normal text-muted-foreground">/天</span>
        </p>
      </div>

      <SectionCard title="基本信息">
        <DetailLine label="车辆状态" value={detail.statusLabel} />
        <DetailLine label="车型" value={detail.typeLabel} />
        <DetailLine label="车牌" value={vehicle.plateNumber} />
        <DetailLine label="车架号" value={vehicle.vin} />
        <DetailLine label="当前里程" value={`${vehicle.mileage.toLocaleString()} km`} />
        <DetailLine label="保养" value={detail.maintenanceHint} />
      </SectionCard>

      {store && (
        <SectionCard title="所属门店">
          <DetailLine label="门店" value={`${store.city} · ${store.name}`} />
          <DetailLine label="地址" value={store.address} />
          <DetailLine label="电话" value={store.phone} />
        </SectionCard>
      )}

      <SectionCard title="证件与设备">
        <DetailLine label="保险到期" value={vehicle.insuranceExpiryDate} />
        <DetailLine label="年检到期" value={vehicle.annualReviewExpiryDate} />
        <DetailLine
          label="GPS"
          value={vehicle.gpsProvider === "TUQIANG" ? "途强" : vehicle.gpsProvider === "CHENGZAI" ? "城载" : "—"}
        />
      </SectionCard>

      {recentEvents.length > 0 && (
        <SectionCard title="近期动态" description="车辆生命周期摘要（演示）">
          <ul className="space-y-2">
            {recentEvents.map((e) => {
              const row = formatVehicleHistoryEvent(e);
              return (
                <li key={e.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                  <p className="font-medium text-foreground">
                    {row.date} · {row.title}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">{row.summary}</p>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      {vehicle.status === "AVAILABLE" && (
        <button
          type="button"
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-medium text-primary-foreground"
          onClick={handleBook}
        >
          预订此车
        </button>
      )}
      {vehicle.status !== "AVAILABLE" && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-center text-xs",
            vehicle.status === "MAINTENANCE" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
          )}
        >
          当前{detail.statusLabel}，暂不可预订
        </p>
      )}
    </div>
  );
}
