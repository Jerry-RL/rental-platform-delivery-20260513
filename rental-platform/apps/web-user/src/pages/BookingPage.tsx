import { PageHeader } from "../components/layout/PageHeader";
import { useFlowContext } from "../context/FlowContext";
import { VehicleOrderPanel } from "../features/panels/VehicleOrderPanel";

export function BookingPage() {
  const { booking } = useFlowContext();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="租车" description="按城市与车型检索可租车辆，配置结算与服务方式后创建订单。" />
      <VehicleOrderPanel
        city={booking.city}
        vehicleTypeId={booking.vehicleTypeId}
        settlementMode={booking.settlementMode}
        serviceMode={booking.serviceMode}
        accountType={booking.accountType}
        billingAccountId={booking.billingAccountId}
        driverId={booking.driverId}
        drivers={booking.drivers}
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
    </div>
  );
}
