import { useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { USE_MOCK_MODE } from "./config/runtime";
import { CorePanel } from "./features/panels/CorePanel";
import { MapGpsPanel } from "./features/panels/MapGpsPanel";
import { QuotaCostPanel } from "./features/panels/QuotaCostPanel";
import { ReminderPanel } from "./features/panels/ReminderPanel";
import { ViolationPanel } from "./features/panels/ViolationPanel";
import { useAdminCoreFlow } from "./hooks/useAdminCoreFlow";
import { useAdminOpsFlow } from "./hooks/useAdminOpsFlow";

type ActivePanel = "core" | "violation" | "quotaCost" | "reminder" | "mapGps";

export default function EntryApp() {
  const [message, setMessage] = useState("");
  const [activePanel, setActivePanel] = useState<ActivePanel>("core");
  const core = useAdminCoreFlow(setMessage);
  const ops = useAdminOpsFlow(core.headers, setMessage);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">Web Admin</Badge>
          <h1 className="text-3xl font-bold tracking-tight">租车平台 - 管理端联调台</h1>
          <p className="text-sm text-muted-foreground">支持核心交易流程 + 扩展能力联调（批量违章/GPS/到期提醒/配额成本）。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={USE_MOCK_MODE ? "warning" : "secondary"}>{USE_MOCK_MODE ? "Mock模式" : "Real模式"}</Badge>
          <Badge variant={core.token ? "success" : "warning"}>{core.token ? "已鉴权" : "未鉴权"}</Badge>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={activePanel === "core" ? "default" : "outline"} onClick={() => setActivePanel("core")}>
          核心流程
        </Button>
        <Button type="button" variant={activePanel === "violation" ? "default" : "outline"} onClick={() => setActivePanel("violation")}>
          批量违章
        </Button>
        <Button
          type="button"
          variant={activePanel === "quotaCost" ? "default" : "outline"}
          onClick={() => setActivePanel("quotaCost")}
        >
          配额与成本
        </Button>
        <Button type="button" variant={activePanel === "reminder" ? "default" : "outline"} onClick={() => setActivePanel("reminder")}>
          到期提醒
        </Button>
        <Button type="button" variant={activePanel === "mapGps" ? "default" : "outline"} onClick={() => setActivePanel("mapGps")}>
          地图与GPS
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>管理员登录</CardTitle>
          <CardDescription>使用联调账号换取访问令牌。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input value={core.phone} onChange={(event) => core.setPhone(event.target.value)} placeholder="手机号" />
          <Input value={core.password} type="password" onChange={(event) => core.setPassword(event.target.value)} placeholder="密码" />
          <Button onClick={core.handleLogin} type="button">
            登录
          </Button>
        </CardContent>
      </Card>

      {activePanel === "core" ? (
        <CorePanel
          orderId={core.orderId}
          billId={core.billId}
          txnNo={core.txnNo}
          orderJson={core.orderJson}
          onOrderIdChange={core.setOrderId}
          onBillIdChange={core.setBillId}
          onTxnNoChange={core.setTxnNo}
          onQueryOrder={core.handleQueryOrder}
          onPaymentCallback={core.handlePaymentCallback}
          onPickup={core.handlePickup}
          onReturn={core.handleReturn}
          onCreateInvoice={core.handleCreateInvoice}
        />
      ) : null}

      {activePanel === "violation" ? (
        <ViolationPanel
          vehiclesText={ops.violationVehiclesText}
          tasks={ops.violationTasks}
          resultJson={ops.violationResultJson}
          onVehiclesTextChange={ops.setViolationVehiclesText}
          onCreateTask={ops.handleCreateViolationTask}
        />
      ) : null}

      {activePanel === "quotaCost" ? (
        <QuotaCostPanel
          quota={ops.quota}
          costMonth={ops.costMonth}
          costs={ops.costRecords}
          onQuotaChange={ops.setQuota}
          onCostMonthChange={ops.setCostMonth}
          onLoadQuota={ops.handleLoadQuota}
          onSaveQuota={ops.handleSaveQuota}
          onLoadCosts={ops.handleLoadCosts}
        />
      ) : null}

      {activePanel === "reminder" ? (
        <ReminderPanel
          rule={ops.reminderRule}
          logsJson={ops.reminderLogsJson}
          onRuleChange={ops.setReminderRule}
          onSaveRule={ops.handleSaveReminderRule}
          onLoadLogs={ops.handleLoadReminderLogs}
        />
      ) : null}

      {activePanel === "mapGps" ? (
        <MapGpsPanel
          mapPolicy={ops.mapPolicy}
          gpsVehicleId={ops.gpsVehicleId}
          gpsSnapshotJson={ops.gpsSnapshotJson}
          onMapPolicyChange={ops.setMapPolicy}
          onGpsVehicleIdChange={ops.setGpsVehicleId}
          onSaveMapPolicy={ops.handleSaveMapPolicy}
          onQueryGpsSnapshot={ops.handleQueryGpsSnapshot}
        />
      ) : null}

      <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
        {message || "等待操作..."}
      </div>
    </main>
  );
}
