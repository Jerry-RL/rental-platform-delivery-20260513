import { Navigate, Outlet } from "react-router-dom";
import { getPreviewUserId } from "@rental-preview/shared";

export function ProtectedLayout() {
  if (!getPreviewUserId()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
