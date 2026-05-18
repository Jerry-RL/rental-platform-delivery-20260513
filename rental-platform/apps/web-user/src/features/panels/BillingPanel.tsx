import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import type { Bill, BillPayment } from "../types";

type Props = {
  orderExists: boolean;
  bill: Bill | null;
  billPayment: BillPayment | null;
  onCreateBill: () => void;
  onConfirmBill: () => void;
  onCreateBillPayment: () => void;
  onBillPaymentCallback: (status: "SUCCESS" | "FAILED") => void;
};

export function BillingPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>账单与对公支付</CardTitle>
        <CardDescription>覆盖生成账单、确认账单、发起支付及支付回调。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-2">
          <Button type="button" onClick={props.onCreateBill} disabled={!props.orderExists}>
            生成账单
          </Button>
          <Button type="button" onClick={props.onConfirmBill} disabled={!props.bill} variant="secondary">
            确认账单
          </Button>
          <Button type="button" onClick={props.onCreateBillPayment} disabled={!props.bill}>
            发起对公支付
          </Button>
          <Button type="button" onClick={() => props.onBillPaymentCallback("SUCCESS")} disabled={!props.billPayment} variant="secondary">
            成功回调
          </Button>
          <Button type="button" onClick={() => props.onBillPaymentCallback("FAILED")} disabled={!props.billPayment} variant="outline">
            失败回调
          </Button>
        </div>
        {props.bill ? (
          <pre className="max-h-80 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(props.bill, null, 2)}</pre>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">暂无账单</div>
        )}
      </CardContent>
    </Card>
  );
}
