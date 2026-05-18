import { PaginationBar } from "../../components/shared/PaginationBar";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { orderStatusLabel, ORDER_STATUS_OPTIONS } from "../../lib/labels";
import type { Order } from "../types";

type Filters = {
  status: string;
  orderNo: string;
  userId: string;
};

type Props = {
  filters: Filters;
  loading: boolean;
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onSelectOrder: (order: Order) => void;
};

const formatTime = (value: string) => {
  try {
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return value;
  }
};

export function OrderListPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>订单列表</CardTitle>
        <CardDescription>全平台订单查询，点击行可跳转核心流程处理。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="订单号"
            value={props.filters.orderNo}
            onChange={(e) => props.onFiltersChange({ ...props.filters, orderNo: e.target.value })}
          />
          <Input
            placeholder="用户 ID"
            value={props.filters.userId}
            onChange={(e) => props.onFiltersChange({ ...props.filters, userId: e.target.value })}
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
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">车牌</th>
                <th className="px-4 py-3 font-medium">城市</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">取车时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {props.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    暂无订单数据
                  </td>
                </tr>
              ) : (
                props.items.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-t border-border transition-colors hover:bg-muted/30"
                    onClick={() => props.onSelectOrder(order)}
                  >
                    <td className="px-4 py-3 font-medium">{order.orderNo}</td>
                    <td className="px-4 py-3">{order.plateNumber}</td>
                    <td className="px-4 py-3">{order.city}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={orderStatusLabel(order.status)} status={order.status} />
                    </td>
                    <td className="px-4 py-3">¥{order.totalFee || order.estimatedFee}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatTime(order.pickupTime)}</td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => props.onSelectOrder(order)}>
                        处理
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar page={props.page} pageSize={props.pageSize} total={props.total} onPageChange={props.onPageChange} />
      </CardContent>
    </Card>
  );
}
