import { Link } from "react-router-dom";
import type { Driver, Personnel } from "@rental-preview/shared";
import { CollapsibleSection } from "../components/ui/collapsible";
import { AdminCrudPanel } from "../components/shared/AdminCrudPanel";
import { driverCrudFields, personnelCrudFields } from "../lib/crud-fields";
import { Button } from "../components/ui/button";

export function StaffPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">司机与内部人员</h2>
        <p className="text-sm text-muted-foreground">
          FR-OPS-008 · 在岗状态、历史包车订单、违章归因 · FR-USER-019 · RBAC 演示
        </p>
      </div>

      <CollapsibleSection title="司机（包车）" defaultOpen>
        <AdminCrudPanel<Driver>
          resource="drivers"
          listPath="/api/v1/admin/drivers"
          formFields={driverCrudFields}
          batchActions={[{ label: "批量执勤", patch: { status: "ON_DUTY" } }]}
          columns={[
            { key: "no", header: "工号", render: (r) => r.driverNo },
            { key: "name", header: "姓名", render: (r) => r.name },
            { key: "city", header: "城市", render: (r) => r.city },
            { key: "status", header: "状态", render: (r) => r.status },
            { key: "rate", header: "评分", render: (r) => String(r.rating) },
            {
              key: "profile",
              header: "档案",
              render: (r) => (
                <Link to={`/staff/drivers/${r.id}`}>
                  <Button type="button" size="sm" variant="outline">
                    历史/违章
                  </Button>
                </Link>
              )
            }
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="后台人员" defaultOpen={false}>
        <AdminCrudPanel<Personnel>
          resource="personnel"
          listPath="/api/v1/admin/personnel"
          formFields={personnelCrudFields}
          batchActions={[{ label: "批量停用", patch: { status: "INACTIVE" } }]}
          columns={[
            { key: "no", header: "工号", render: (r) => r.employeeNo },
            { key: "name", header: "姓名", render: (r) => r.name },
            { key: "role", header: "角色", render: (r) => r.role },
            { key: "dept", header: "部门", render: (r) => r.department },
            { key: "scope", header: "数据范围", render: (r) => r.storeScope.join(", ") }
          ]}
        />
      </CollapsibleSection>
    </div>
  );
}
