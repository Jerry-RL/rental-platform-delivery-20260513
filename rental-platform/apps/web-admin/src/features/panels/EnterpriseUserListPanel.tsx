import { PaginationBar } from "../../components/shared/PaginationBar";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ACCOUNT_TYPE_OPTIONS, accountTypeLabel, USER_STATUS_OPTIONS, userStatusLabel } from "../../lib/labels";
import type { EnterpriseAccount } from "../types";

type Filters = { keyword: string; status: string; accountType: string };
type CreateForm = {
  orgName: string;
  accountType: EnterpriseAccount["accountType"];
  contactName: string;
  contactPhone: string;
  creditLimit: string;
};

type Props = {
  filters: Filters;
  createForm: CreateForm;
  loading: boolean;
  items: EnterpriseAccount[];
  total: number;
  page: number;
  pageSize: number;
  onFiltersChange: (filters: Filters) => void;
  onCreateFormChange: (form: CreateForm) => void;
  onSearch: () => void;
  onCreate: () => void;
  onPageChange: (page: number) => void;
  onStatusChange: (accountId: string, status: EnterpriseAccount["status"]) => void;
};

const formatCredit = (value: number) => `¥${value.toLocaleString("zh-CN")}`;

export function EnterpriseUserListPanel(props: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新增企业账户</CardTitle>
          <CardDescription>B/G 类企业或政府单位，用于后付费与对公结算。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Input placeholder="企业/机构名称" value={props.createForm.orgName} onChange={(e) => props.onCreateFormChange({ ...props.createForm, orgName: e.target.value })} />
          <select
            value={props.createForm.accountType}
            onChange={(e) => props.onCreateFormChange({ ...props.createForm, accountType: e.target.value as EnterpriseAccount["accountType"] })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {ACCOUNT_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {accountTypeLabel(type)}
              </option>
            ))}
          </select>
          <Input placeholder="联系人" value={props.createForm.contactName} onChange={(e) => props.onCreateFormChange({ ...props.createForm, contactName: e.target.value })} />
          <Input placeholder="联系电话" value={props.createForm.contactPhone} onChange={(e) => props.onCreateFormChange({ ...props.createForm, contactPhone: e.target.value })} />
          <Input placeholder="授信额度" value={props.createForm.creditLimit} onChange={(e) => props.onCreateFormChange({ ...props.createForm, creditLimit: e.target.value })} />
          <Button type="button" onClick={props.onCreate}>
            新增
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>企业用户列表</CardTitle>
          <CardDescription>企业/政府账务主体，账单与订单可关联 accountNo。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="企业名/编号/联系人" value={props.filters.keyword} onChange={(e) => props.onFiltersChange({ ...props.filters, keyword: e.target.value })} />
            <select
              value={props.filters.accountType}
              onChange={(e) => props.onFiltersChange({ ...props.filters, accountType: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">全部类型</option>
              {ACCOUNT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {accountTypeLabel(type)}
                </option>
              ))}
            </select>
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
            <Button type="button" onClick={props.onSearch} disabled={props.loading}>
              {props.loading ? "加载中…" : "查询"}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">账户编号</th>
                  <th className="px-4 py-3 font-medium">企业名称</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">联系人</th>
                  <th className="px-4 py-3 font-medium">授信额度</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {props.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      暂无企业用户
                    </td>
                  </tr>
                ) : (
                  props.items.map((account) => (
                    <tr key={account.id} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-xs">{account.accountNo}</td>
                      <td className="px-4 py-3 font-medium">{account.orgName}</td>
                      <td className="px-4 py-3">{accountTypeLabel(account.accountType)}</td>
                      <td className="px-4 py-3">
                        {account.contactName}
                        <span className="block text-xs text-muted-foreground">{account.contactPhone}</span>
                      </td>
                      <td className="px-4 py-3">{formatCredit(account.creditLimit)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={userStatusLabel(account.status)} status={account.status} />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={account.status}
                          onChange={(e) => props.onStatusChange(account.id, e.target.value as EnterpriseAccount["status"])}
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
