import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";
import { FlowProvider } from "./context/FlowContext";
import { AuthPage } from "./pages/AuthPage";
import { BillingPage } from "./pages/BillingPage";
import { BookingPage } from "./pages/BookingPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ServicesPage } from "./pages/ServicesPage";

function AppProviders() {
  return (
    <FlowProvider>
      <Outlet />
    </FlowProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppProviders />,
    children: [
      { index: true, element: <Navigate to="/auth" replace /> },
      { path: "auth", element: <AuthPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: "booking", element: <BookingPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "billing", element: <BillingPage /> },
              { path: "services", element: <ServicesPage /> }
            ]
          }
        ]
      },
      { path: "*", element: <Navigate to="/auth" replace /> }
    ]
  }
]);
