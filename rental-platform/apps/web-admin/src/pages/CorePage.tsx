import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { useAdminFlowContext } from "../context/AdminFlowContext";
import { CorePanel } from "../features/panels/CorePanel";

export function CorePage() {
  const [searchParams] = useSearchParams();
  const { core } = useAdminFlowContext();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      core.setOrderId(orderId);
    }
  }, [searchParams]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="核心流程" description="订单查询、支付回调、提车/还车与开票。" />
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
    </div>
  );
}
