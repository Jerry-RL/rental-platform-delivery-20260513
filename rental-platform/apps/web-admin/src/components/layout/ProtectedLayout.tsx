import { Navigate, Outlet } from "react-router-dom";
import { useAdminFlowContext } from "../../context/AdminFlowContext";

export function ProtectedLayout() {
  const { core } = useAdminFlowContext();

  if (!core.token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
