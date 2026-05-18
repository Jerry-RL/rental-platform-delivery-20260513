import { PageHeader } from "../components/layout/PageHeader";
import { useFlowContext } from "../context/FlowContext";
import { BillingPanel } from "../features/panels/BillingPanel";

export function BillingPage() {
  const { booking } = useFlowContext();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="账单" description="生成账单、确认账单、发起对公支付及模拟支付回调。" />
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
  );
}
