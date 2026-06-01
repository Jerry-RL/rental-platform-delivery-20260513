import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ExtensionsPage } from "./pages/ExtensionsPage";
import { FinancePage } from "./pages/FinancePage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { LoginPage } from "./pages/LoginPage";
import { OperationsPage } from "./pages/OperationsPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PricingPage } from "./pages/PricingPage";
import { OrgsLayout } from "./components/layout/OrgsLayout";
import { OrgDetailPage } from "./pages/OrgDetailPage";
import { OrgsApprovalsTab } from "./pages/orgs/OrgsApprovalsTab";
import { OrgsCustomersTab } from "./pages/orgs/OrgsCustomersTab";
import { OrgsMembersTab } from "./pages/orgs/OrgsMembersTab";
import { PaymentsPage } from "./pages/PaymentsPage";
import { DriverDetailPage } from "./pages/DriverDetailPage";
import { StaffPage } from "./pages/StaffPage";
import { TicketsPage } from "./pages/TicketsPage";
import { UsersPage } from "./pages/UsersPage";
import { VehiclesLayout } from "./components/layout/VehiclesLayout";
import { VehicleHistoryDetailPage } from "./pages/VehicleHistoryDetailPage";
import { VehiclesHistoryTab } from "./pages/vehicles/VehiclesHistoryTab";
import { VehiclesInventoryTab } from "./pages/vehicles/VehiclesInventoryTab";
import { VehiclesMaintenanceTab } from "./pages/vehicles/VehiclesMaintenanceTab";
import { VehiclesMileageTab } from "./pages/vehicles/VehiclesMileageTab";
import { VehiclesViolationsTab } from "./pages/vehicles/VehiclesViolationsTab";

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "users", element: <UsersPage /> },
              {
                path: "orgs",
                element: <OrgsLayout />,
                children: [
                  { index: true, element: <Navigate to="customers" replace /> },
                  { path: "customers", element: <OrgsCustomersTab /> },
                  { path: "members", element: <OrgsMembersTab /> },
                  { path: "approvals", element: <OrgsApprovalsTab /> }
                ]
              },
              { path: "orgs/:orgId", element: <OrgDetailPage /> },
              {
                path: "vehicles",
                element: <VehiclesLayout />,
                children: [
                  { index: true, element: <Navigate to="inventory" replace /> },
                  { path: "inventory", element: <VehiclesInventoryTab /> },
                  { path: "history", element: <VehiclesHistoryTab /> },
                  { path: "mileage", element: <VehiclesMileageTab /> },
                  { path: "violations", element: <VehiclesViolationsTab /> },
                  { path: "maintenance", element: <VehiclesMaintenanceTab /> }
                ]
              },
              { path: "vehicles/:vehicleId/history", element: <VehicleHistoryDetailPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "orders/:orderId", element: <OrderDetailPage /> },
              { path: "pricing", element: <PricingPage /> },
              { path: "incidents", element: <IncidentsPage /> },
              { path: "incidents/:incidentId", element: <IncidentDetailPage /> },
              { path: "payments", element: <PaymentsPage /> },
              { path: "finance", element: <FinancePage /> },
              { path: "invoices", element: <InvoicesPage /> },
              { path: "tickets", element: <TicketsPage /> },
              { path: "operations", element: <OperationsPage /> },
              { path: "staff", element: <StaffPage /> },
              { path: "staff/drivers/:driverId", element: <DriverDetailPage /> },
              { path: "extensions", element: <ExtensionsPage /> }
            ]
          }
        ]
      },
      { path: "*", element: <Navigate to="/login" replace /> }
    ]
  }
]);
