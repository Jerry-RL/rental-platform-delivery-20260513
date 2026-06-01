import { Link, useParams } from "react-router-dom";
import { DriverProfilePanel } from "../components/shared/DriverProfilePanel";

export function DriverDetailPage() {
  const { driverId } = useParams();

  if (!driverId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">缺少司机 ID</p>
        <Link to="/staff" className="text-sm text-primary hover:underline">
          ← 返回司机与人员
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/staff" className="text-sm text-primary hover:underline">
          ← 司机与人员
        </Link>
        <h2 className="mt-2 text-lg font-semibold">司机档案</h2>
        <p className="text-sm text-muted-foreground">
          FR-OPS-008 · GET /api/v1/admin/drivers/:id/profile
        </p>
      </div>
      <DriverProfilePanel driverId={driverId} />
    </div>
  );
}
