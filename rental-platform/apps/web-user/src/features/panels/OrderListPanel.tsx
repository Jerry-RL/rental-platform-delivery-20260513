import { PaginationBar } from "../../components/shared/PaginationBar";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { JsonViewer } from "../../components/shared/JsonViewer";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { orderStatusLabel, ORDER_STATUS_OPTIONS } from "../../lib/labels";
import type { Order } from "../types";

type Filters = {
  status: string;
  orderNo: string;
};

type Props = {
  filters: Filters;
  loading: boolean;
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  selected: Order | null;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onSelect: (order: Order) => void;
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return value;
  }
};

export function OrderListPanel(props: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>我的订单</CardTitle>
          <CardDescription>查看历史订单，点击行查看详情。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="订单号"
              value={props.filters.orderNo}
              onChange={(e) => props.onFiltersChange({ ...props.filters, orderNo: e.target.value })}
            />
            <select
              value={props.filters.status}
              onChange={(e) => props.onFiltersChange({ ...props.filters, status: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">全部状态</option>
              {ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" onClick={props.onSearch} disabled={props.loading}>
            {props.loading ? "加载中…" : "查询"}
          </Button>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">订单号</th>
                  <th className="px-4 py-3 font-medium">车牌</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">金额</th>
                </tr>
              </thead>
              <tbody>
                {props.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                      暂无订单，请先在「租车」页下单
                    </td>
                  </tr>
                ) : (
                  props.items.map((order) => (
                    <tr
                      key={order.id}
                      className={`cursor-pointer border-t border-border transition-colors hover:bg-muted/30 ${
                        props.selected?.id === order.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => props.onSelect(order)}
                    >
                      <td className="px-4 py-3 font-medium">{order.orderNo}</td>
                      <td className="px-4 py-3">{order.plateNumber ?? "-"}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={orderStatusLabel(order.status)} status={order.status} />
                      </td>
                      <td className="px-4 py-3">¥{order.totalFee || order.estimatedFee}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar page={props.page} pageSize={props.pageSize} total={props.total} onPageChange={props.onPageChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>订单详情</CardTitle>
          <CardDescription>
            {props.selected ? `${props.selected.orderNo} · ${formatTime(props.selected.pickupTime)}` : "选择左侧订单查看"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JsonViewer value={props.selected} emptyText="请选择一条订单" />
        </CardContent>
      </Card>
    </div>
  );
}
