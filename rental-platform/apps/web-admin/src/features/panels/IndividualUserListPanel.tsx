import { PaginationBar } from "../../components/shared/PaginationBar";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { USER_STATUS_OPTIONS, userStatusLabel } from "../../lib/labels";
import type { IndividualUser } from "../types";

type Filters = { keyword: string; status: string; licenseValid: string };
type CreateForm = { phone: string; password: string; realName: string; licenseValid: boolean };

type Props = {
  filters: Filters;
  createForm: CreateForm;
  loading: boolean;
  items: IndividualUser[];
  total: number;
  page: number;
  pageSize: number;
  onFiltersChange: (filters: Filters) => void;
  onCreateFormChange: (form: CreateForm) => void;
  onSearch: () => void;
  onCreate: () => void;
  onPageChange: (page: number) => void;
  onStatusChange: (userId: string, status: IndividualUser["status"]) => void;
};

const formatTime = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("zh-CN");
  } catch {
    return value;
  }
};

export function IndividualUserListPanel(props: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新增普通用户</CardTitle>
          <CardDescription>C 端个人租车用户，需有效驾照方可下单。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Input placeholder="手机号" value={props.createForm.phone} onChange={(e) => props.onCreateFormChange({ ...props.createForm, phone: e.target.value })} />
          <Input placeholder="密码" type="password" value={props.createForm.password} onChange={(e) => props.onCreateFormChange({ ...props.createForm, password: e.target.value })} />
          <Input placeholder="真实姓名" value={props.createForm.realName} onChange={(e) => props.onCreateFormChange({ ...props.createForm, realName: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={props.createForm.licenseValid}
              onChange={(e) => props.onCreateFormChange({ ...props.createForm, licenseValid: e.target.checked })}
            />
            驾照有效
          </label>
          <Button type="button" onClick={props.onCreate}>
            新增
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>普通用户列表</CardTitle>
          <CardDescription>个人注册用户，支持后付费订单关联。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="手机/姓名/ID" value={props.filters.keyword} onChange={(e) => props.onFiltersChange({ ...props.filters, keyword: e.target.value })} />
            <select
              value={props.filters.status}
              onChange={(e) => props.onFiltersChange({ ...props.filters, status: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">全部状态</option>
              {USER_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {userStatusLabel(s)}
                </option>
              ))}
            </select>
            <select
              value={props.filters.licenseValid}
              onChange={(e) => props.onFiltersChange({ ...props.filters, licenseValid: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">驾照状态</option>
              <option value="true">驾照有效</option>
              <option value="false">驾照无效</option>
            </select>
            <Button type="button" onClick={props.onSearch} disabled={props.loading}>
              {props.loading ? "加载中…" : "查询"}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">手机号</th>
                  <th className="px-4 py-3 font-medium">驾照</th>
                  <th className="px-4 py-3 font-medium">订单数</th>
                  <th className="px-4 py-3 font-medium">注册时间</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {props.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      暂无普通用户
                    </td>
                  </tr>
                ) : (
                  props.items.map((user) => (
                    <tr key={user.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{user.realName}</td>
                      <td className="px-4 py-3">{user.phone}</td>
                      <td className="px-4 py-3">{user.licenseValid ? "有效" : "无效"}</td>
                      <td className="px-4 py-3">{user.orderCount}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatTime(user.registeredAt)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={userStatusLabel(user.status)} status={user.status} />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.status}
                          onChange={(e) => props.onStatusChange(user.id, e.target.value as IndividualUser["status"])}
                          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {USER_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {userStatusLabel(s)}
                            </option>
                          ))}
                        </select>
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
    </div>
  );
}
