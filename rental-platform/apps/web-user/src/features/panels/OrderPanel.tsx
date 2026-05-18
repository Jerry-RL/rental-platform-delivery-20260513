import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import type { Order } from "../types";

type Props = {
  order: Order | null;
};

export function OrderPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3) 当前订单</CardTitle>
        <CardDescription>展示订单创建结果与最新状态。</CardDescription>
      </CardHeader>
      <CardContent>
        {props.order ? (
          <pre className="max-h-80 overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(props.order, null, 2)}</pre>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">暂无订单</div>
        )}
      </CardContent>
    </Card>
  );
}
