import { useState } from "react";
import { Badge } from "./components/ui/badge";
import { USE_MOCK_MODE } from "./config/runtime";
import { AuthPanel } from "./features/panels/AuthPanel";
import { BillingPanel } from "./features/panels/BillingPanel";
import { ExtensionSummaryPanel } from "./features/panels/ExtensionSummaryPanel";
import { LocationGpsPanel } from "./features/panels/LocationGpsPanel";
import { OrderPanel } from "./features/panels/OrderPanel";
import { VehicleOrderPanel } from "./features/panels/VehicleOrderPanel";
import { useUserBookingFlow } from "./hooks/useUserBookingFlow";
import { useUserExtensionFlow } from "./hooks/useUserExtensionFlow";

export default function EntryApp() {
  const [message, setMessage] = useState("");
  const booking = useUserBookingFlow(setMessage);
  const extension = useUserExtensionFlow(booking.authHeader, setMessage);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">Web User</Badge>
          <h1 className="text-3xl font-bold tracking-tight">租车平台 - 用户端流程台</h1>
          <p className="text-sm text-muted-foreground">流程：注册/登录 → 查车 → 下单 → 账单确认 → 对公支付。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={USE_MOCK_MODE ? "warning" : "secondary"}>{USE_MOCK_MODE ? "Mock模式" : "Real模式"}</Badge>
          <Badge variant={booking.token ? "success" : "warning"}>{booking.token ? "已登录" : "未登录"}</Badge>
        </div>
      </header>

      <AuthPanel
        phone={booking.phone}
        password={booking.password}
        onPhoneChange={booking.setPhone}
        onPasswordChange={booking.setPassword}
        onRegister={booking.handleRegister}
        onLogin={booking.handleLogin}
      />

      <VehicleOrderPanel
        city={booking.city}
        vehicleTypeId={booking.vehicleTypeId}
        settlementMode={booking.settlementMode}
        serviceMode={booking.serviceMode}
        accountType={booking.accountType}
        billingAccountId={booking.billingAccountId}
        driverId={booking.driverId}
        vehicles={booking.vehicles}
        token={booking.token}
        onCityChange={booking.setCity}
        onVehicleTypeIdChange={booking.setVehicleTypeId}
        onSettlementModeChange={booking.setSettlementMode}
        onServiceModeChange={booking.setServiceMode}
        onAccountTypeChange={booking.setAccountType}
        onBillingAccountIdChange={booking.setBillingAccountId}
        onDriverIdChange={booking.setDriverId}
        onSearchVehicles={booking.handleSearchVehicles}
        onCreateOrder={booking.handleCreateOrder}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <OrderPanel order={booking.order} />
        <BillingPanel
          orderExists={Boolean(booking.order)}
          bill={booking.bill}
          billPayment={booking.billPayment}
          onCreateBill={booking.handleCreateBill}
          onConfirmBill={booking.handleConfirmBill}
          onCreateBillPayment={booking.handleCreateBillPayment}
          onBillPaymentCallback={booking.handleBillPaymentCallback}
        />
      </div>

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

      <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">{message || "等待操作..."}</div>
    </main>
  );
}
