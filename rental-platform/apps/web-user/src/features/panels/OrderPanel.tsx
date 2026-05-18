import { JsonViewer } from "../../components/shared/JsonViewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import type { Order } from "../types";

type Props = {
  order: Order | null;
};

export function OrderPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>当前订单</CardTitle>
        <CardDescription>展示订单创建结果与最新状态。</CardDescription>
      </CardHeader>
      <CardContent>
        <JsonViewer value={props.order} emptyText="暂无订单，请先在「租车」页创建订单" />
      </CardContent>
    </Card>
  );
}
