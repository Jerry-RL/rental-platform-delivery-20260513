import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

type Props = {
  orderId: string;
  billId: string;
  txnNo: string;
  orderJson: string;
  onOrderIdChange: (value: string) => void;
  onBillIdChange: (value: string) => void;
  onTxnNoChange: (value: string) => void;
  onQueryOrder: () => void;
  onPaymentCallback: (status: "SUCCESS" | "FAILED") => void;
  onPickup: () => void;
  onReturn: () => void;
  onCreateInvoice: () => void;
};

export function CorePanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>订单与账单操作</CardTitle>
        <CardDescription>统一处理查询、回调、提车、还车、开票等关键动作。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={props.orderId} onChange={(event) => props.onOrderIdChange(event.target.value)} placeholder="订单ID" />
          <Input value={props.billId} onChange={(event) => props.onBillIdChange(event.target.value)} placeholder="账单ID(可选)" />
          <Input value={props.txnNo} onChange={(event) => props.onTxnNoChange(event.target.value)} placeholder="渠道交易号" />
        </div>
        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
          <Button type="button" onClick={props.onQueryOrder}>
            查询订单
          </Button>
          <Button type="button" onClick={() => props.onPaymentCallback("SUCCESS")} variant="secondary">
            支付成功回调
          </Button>
          <Button type="button" onClick={() => props.onPaymentCallback("FAILED")} variant="outline">
            支付失败回调
          </Button>
          <Button type="button" onClick={props.onPickup}>
            提车
          </Button>
          <Button type="button" onClick={props.onReturn} variant="secondary">
            还车结算
          </Button>
          <Button type="button" onClick={props.onCreateInvoice} variant="outline">
            申请发票
          </Button>
        </div>
        <pre className="max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{props.orderJson}</pre>
      </CardContent>
    </Card>
  );
}
