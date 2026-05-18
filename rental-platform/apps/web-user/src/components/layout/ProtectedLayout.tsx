import { Navigate, Outlet } from "react-router-dom";
import { useFlowContext } from "../../context/FlowContext";

export function ProtectedLayout() {
  const { booking } = useFlowContext();

  if (!booking.token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
