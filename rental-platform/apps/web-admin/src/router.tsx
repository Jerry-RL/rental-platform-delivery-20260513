import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";
import { AdminFlowProvider } from "./context/AdminFlowContext";
import { CorePage } from "./pages/CorePage";
import { DriversPage } from "./pages/DriversPage";
import { PersonnelPage } from "./pages/PersonnelPage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { MapGpsPage } from "./pages/MapGpsPage";
import { QuotaPage } from "./pages/QuotaPage";
import { ReminderPage } from "./pages/ReminderPage";
import { UsersPage } from "./pages/UsersPage";
import { ViolationPage } from "./pages/ViolationPage";

function AppProviders() {
  return (
    <AdminFlowProvider>
      <Outlet />
    </AdminFlowProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppProviders />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <Navigate to="/orders" replace /> },
              { path: "vehicles", element: <VehiclesPage /> },
              { path: "drivers", element: <DriversPage /> },
              { path: "personnel", element: <PersonnelPage /> },
              { path: "users", element: <UsersPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "core", element: <CorePage /> },
              { path: "violations", element: <ViolationPage /> },
              { path: "quota", element: <QuotaPage /> },
              { path: "reminders", element: <ReminderPage /> },
              { path: "map-gps", element: <MapGpsPage /> }
            ]
          }
        ]
      },
      { path: "*", element: <Navigate to="/login" replace /> }
    ]
  }
]);
