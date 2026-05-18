import { PaginationBar } from "../../components/shared/PaginationBar";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  PERSONNEL_ROLE_OPTIONS,
  PERSONNEL_STATUS_OPTIONS,
  personnelRoleLabel,
  personnelStatusLabel
} from "../../lib/labels";
import type { Personnel } from "../types";

type Filters = { role: string; status: string; department: string; keyword: string };
type CreateForm = {
  name: string;
  phone: string;
  email: string;
  role: Personnel["role"];
  department: string;
};

type Props = {
  filters: Filters;
  createForm: CreateForm;
  loading: boolean;
  items: Personnel[];
  total: number;
  page: number;
  pageSize: number;
  onFiltersChange: (filters: Filters) => void;
  onCreateFormChange: (form: CreateForm) => void;
  onSearch: () => void;
  onCreate: () => void;
  onPageChange: (page: number) => void;
  onStatusChange: (personnelId: string, status: Personnel["status"]) => void;
};

export function PersonnelListPanel(props: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>新增人员</CardTitle>
          <CardDescription>录入内部员工，分配角色与部门。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Input placeholder="姓名" value={props.createForm.name} onChange={(e) => props.onCreateFormChange({ ...props.createForm, name: e.target.value })} />
          <Input placeholder="手机号" value={props.createForm.phone} onChange={(e) => props.onCreateFormChange({ ...props.createForm, phone: e.target.value })} />
          <Input placeholder="邮箱" value={props.createForm.email} onChange={(e) => props.onCreateFormChange({ ...props.createForm, email: e.target.value })} />
          <select
            value={props.createForm.role}
            onChange={(e) => props.onCreateFormChange({ ...props.createForm, role: e.target.value as Personnel["role"] })}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {PERSONNEL_ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {personnelRoleLabel(role)}
              </option>
            ))}
          </select>
          <Input placeholder="部门" value={props.createForm.department} onChange={(e) => props.onCreateFormChange({ ...props.createForm, department: e.target.value })} />
          <Button type="button" onClick={props.onCreate}>
            新增
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>人员列表</CardTitle>
          <CardDescription>管理内部账号、角色与在职状态。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={props.filters.role}
              onChange={(e) => props.onFiltersChange({ ...props.filters, role: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">全部角色</option>
              {PERSONNEL_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {personnelRoleLabel(role)}
                </option>
              ))}
            </select>
            <select
              value={props.filters.status}
              onChange={(e) => props.onFiltersChange({ ...props.filters, status: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">全部状态</option>
              {PERSONNEL_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {personnelStatusLabel(s)}
                </option>
              ))}
            </select>
            <Input placeholder="部门" value={props.filters.department} onChange={(e) => props.onFiltersChange({ ...props.filters, department: e.target.value })} />
            <Input placeholder="姓名/手机/工号" value={props.filters.keyword} onChange={(e) => props.onFiltersChange({ ...props.filters, keyword: e.target.value })} />
          </div>
          <Button type="button" onClick={props.onSearch} disabled={props.loading}>
            {props.loading ? "加载中…" : "查询"}
          </Button>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">工号</th>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">手机</th>
                  <th className="px-4 py-3 font-medium">角色</th>
                  <th className="px-4 py-3 font-medium">部门</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {props.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      暂无人员数据
                    </td>
                  </tr>
                ) : (
                  props.items.map((member) => (
                    <tr key={member.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{member.employeeNo}</td>
                      <td className="px-4 py-3">{member.name}</td>
                      <td className="px-4 py-3">{member.phone}</td>
                      <td className="px-4 py-3">{personnelRoleLabel(member.role)}</td>
                      <td className="px-4 py-3">{member.department}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={personnelStatusLabel(member.status)} status={member.status} />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={member.status}
                          onChange={(e) => props.onStatusChange(member.id, e.target.value as Personnel["status"])}
                          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {PERSONNEL_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {personnelStatusLabel(s)}
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
