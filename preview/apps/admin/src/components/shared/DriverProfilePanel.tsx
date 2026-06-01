import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  driverStatusLabel,
  type DriverAdminProfile,
  type DriverOrderHistoryItem,
  type DriverViolationItem
} from "@rental-preview/shared";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTable, type Column } from "./DataTable";
import { cn } from "../../lib/utils";

type DriverProfilePanelProps = {
  driverId: string;
};

const statusTone = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-success/10 text-success";
    case "ON_DUTY":
      return "bg-primary/10 text-primary";
    case "OFF_DUTY":
      return "bg-muted text-muted-foreground";
    case "SUSPENDED":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatRange = (from: string, to: string) =>
  `${from.slice(0, 10)} → ${to.slice(0, 10)}`;

const orderColumns: Column<DriverOrderHistoryItem>[] = [
  {
    key: "orderNo",
    header: "订单号",
    render: (r) => (
      <Link to={`/orders/${r.id}`} className="font-medium text-primary hover:underline">
        {r.orderNo}
      </Link>
    )
  },
  { key: "plate", header: "车牌", render: (r) => r.plateNumber },
  { key: "mode", header: "服务", render: (r) => r.serviceModeLabel },
  { key: "period", header: "租期", render: (r) => formatRange(r.pickupTime, r.returnTime) },
  {
    key: "fee",
    header: "司机费/总额",
    render: (r) => (
      <span>
        ¥{r.chauffeurFee} / ¥{r.totalFee}
      </span>
    )
  },
  {
    key: "status",
    header: "状态",
    render: (r) => <Badge variant="secondary">{r.statusLabel}</Badge>
  }
];

const violationColumns: Column<DriverViolationItem>[] = [
  {
    key: "time",
    header: "违章时间",
    render: (r) => r.violationTime.slice(0, 16).replace("T", " ")
  },
  { key: "plate", header: "车牌", render: (r) => r.plateNumber },
  { key: "loc", header: "地点", render: (r) => r.location },
  {
    key: "fine",
    header: "罚款/扣分",
    render: (r) => (
      <span>
        ¥{r.fineAmount} · {r.points} 分
      </span>
    )
  },
  {
    key: "pay",
    header: "缴款",
    render: (r) => (
      <Badge variant={r.status === "UNPAID" ? "warning" : "secondary"}>{r.paymentLabel}</Badge>
    )
  },
  {
    key: "handle",
    header: "处理",
    render: (r) => <Badge variant="outline">{r.handleLabel}</Badge>
  },
  {
    key: "order",
    header: "关联订单",
    render: (r) =>
      r.relatedOrderId ? (
        <Link to={`/orders/${r.relatedOrderId}`} className="text-primary hover:underline">
          {r.relatedOrderNo ?? "查看"}
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
  },
  {
    key: "attr",
    header: "归因",
    render: (r) => (
      <span className="text-xs text-muted-foreground">
        {r.attribution === "EXPLICIT" ? "明确归属" : "租期内推断"}
      </span>
    )
  }
];

export function DriverProfilePanel({ driverId }: DriverProfilePanelProps) {
  const [profile, setProfile] = useState<DriverAdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get<DriverAdminProfile>(`/api/v1/admin/drivers/${driverId}/profile`);
    setProfile(res.ok ? res.data : null);
    setLoading(false);
  }, [driverId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">加载司机档案…</p>;
  }

  if (!profile) {
    return <p className="text-sm text-muted-foreground">司机不存在或已删除</p>;
  }

  const { driver, detail, stats, orders, violations } = profile;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">
                {driver.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {driver.driverNo}
                </span>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {driver.city} · {driver.licenseType} · {driver.phone}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                statusTone(driver.status)
              )}
            >
              {driverStatusLabel[driver.status]}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="leading-relaxed text-muted-foreground">{detail.intro}</p>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span>
              驾龄 <strong className="text-foreground">{detail.experienceYears}</strong> 年
            </span>
            <span>
              评分 <strong className="text-foreground">{driver.rating.toFixed(1)}</strong>
            </span>
            <span>
              服务城市 <strong className="text-foreground">{detail.serviceCities.join("、")}</strong>
            </span>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
            刷新档案
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "历史包车单", value: stats.totalOrders, sub: `进行中 ${stats.activeOrders}` },
          { label: "已完成", value: stats.completedOrders },
          { label: "累计司机费", value: `¥${stats.totalChauffeurFee}` },
          {
            label: "关联违章",
            value: stats.violationTotal,
            sub:
              stats.violationTotal > 0
                ? `未缴 ${stats.violationUnpaid} · 待处理 ${stats.violationUnprocessed} · ${stats.violationPoints} 分`
                : "暂无"
          }
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-xl font-semibold">{item.value}</p>
              {item.sub && <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">历史订单（包车带司机）</h3>
          <p className="text-xs text-muted-foreground">
            FR-OPS-008 · 按取车时间倒序 · 仅含已指派该司机的订单
          </p>
        </div>
        <DataTable
          columns={orderColumns}
          rows={orders}
          emptyText="该司机暂无包车服务订单"
        />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium">违章情况</h3>
            <p className="text-xs text-muted-foreground">
              含明确归属司机记录，以及包车租期内同车违章推断
            </p>
          </div>
          <Link
            to="/vehicles/violations"
            className="text-xs text-primary hover:underline"
          >
            车队违章批量查询 →
          </Link>
        </div>
        <DataTable
          columns={violationColumns}
          rows={violations}
          emptyText="暂无关联违章记录"
        />
      </section>
    </div>
  );
}
