import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  api,
  driverStatusLabel,
  type DriverDetailView
} from "@rental-preview/shared";
import { DetailLine } from "../components/DetailLine";
import { SectionCard } from "../components/SectionCard";
import { cn } from "../lib/utils";

const statusTone = (status: DriverDetailView["status"]) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-success/10 text-success";
    case "ON_DUTY":
      return "bg-primary/10 text-primary";
    case "OFF_DUTY":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-destructive/10 text-destructive";
  }
};

export function DriverDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get("from");

  const [driver, setDriver] = useState<DriverDetailView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await api.get<DriverDetailView>(`/api/v1/drivers/${id}`);
    setLoading(false);
    if (res.ok && res.data) setDriver(res.data);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBack = () => {
    if (from) navigate(-1);
    else navigate("/home");
  };

  if (loading) return <p className="p-4 text-sm text-muted-foreground">加载中…</p>;
  if (!driver) {
    return (
      <div className="space-y-4 p-4">
        <button type="button" className="text-sm text-primary" onClick={handleBack}>
          ← 返回
        </button>
        <p className="text-sm text-muted-foreground">司机信息不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-8">
      <button type="button" className="text-sm text-primary" onClick={handleBack}>
        ← 返回
      </button>

      <div className="card-surface flex items-center gap-4 p-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary"
          aria-hidden
        >
          {driver.name.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold">{driver.name}</h1>
          <p className="text-sm text-muted-foreground">工号 {driver.driverNo}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", statusTone(driver.status))}>
              {driverStatusLabel[driver.status]}
            </span>
            <span className="text-xs text-muted-foreground">
              评分 <strong className="text-foreground">{driver.rating.toFixed(1)}</strong>
            </span>
          </div>
        </div>
      </div>

      <p className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
        {driver.intro}
      </p>

      <SectionCard title="服务数据">
        <DetailLine label="驾龄" value={`${driver.experienceYears} 年`} />
        <DetailLine label="完成订单" value={`约 ${driver.completedTrips.toLocaleString()} 单`} />
        {driver.recentOrderCount != null && (
          <DetailLine label="平台包车单" value={`${driver.recentOrderCount} 单（演示数据）`} />
        )}
        {driver.violationCount != null && driver.violationCount > 0 && (
          <DetailLine label="关联违章" value={`${driver.violationCount} 条（租期内已处理/跟进中）`} />
        )}
        <DetailLine label="服务城市" value={driver.serviceCities.join("、")} />
      </SectionCard>

      <SectionCard title="资质信息">
        <DetailLine label="准驾车型" value={driver.licenseType} />
        <DetailLine label="驾驶证号" value={`${driver.licenseNo.slice(0, 6)}********`} />
        <DetailLine label="联系电话" value={driver.phone} />
      </SectionCard>

      <SectionCard title="说明">
        <p className="text-xs leading-relaxed text-muted-foreground">
          包车订单将由平台指派持证司机；下单后可在订单详情查看指派结果。司机信息仅供用车前了解，实际指派以订单为准。
        </p>
      </SectionCard>
    </div>
  );
}
