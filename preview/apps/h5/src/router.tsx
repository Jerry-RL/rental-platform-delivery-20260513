import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { getPreviewUserId } from "@rental-preview/shared";
import { MobileShell } from "./components/MobileShell";
import { BillingPage } from "./pages/BillingPage";
import { BookingPage } from "./pages/BookingPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LicensePage } from "./pages/LicensePage";
import { MePage } from "./pages/MePage";
import { RealnamePage } from "./pages/RealnamePage";
import { DriverDetailPage } from "./pages/DriverDetailPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { VehicleDetailPage } from "./pages/VehicleDetailPage";
import { ViolationsPage } from "./pages/ViolationsPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { ReportIncidentPage } from "./pages/ReportIncidentPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getPreviewUserId()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "login", element: <LoginPage /> },
  { path: "register", element: <RegisterPage /> },
  {
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "booking", element: <BookingPage /> },
      { path: "vehicles/:id", element: <VehicleDetailPage /> },
      { path: "drivers/:id", element: <DriverDetailPage /> },
      { path: "license", element: <LicensePage /> },
      { path: "realname", element: <RealnamePage /> },
      { path: "violations", element: <ViolationsPage /> },
      { path: "incidents", element: <IncidentsPage /> },
      { path: "incidents/:id", element: <IncidentDetailPage /> },
      { path: "orders/:orderId/report-incident", element: <ReportIncidentPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
      {
        element: <MobileShell />,
        children: [
          { path: "home", element: <HomePage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "billing", element: <BillingPage /> },
          { path: "me", element: <MePage /> }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/login" replace /> }
]);
