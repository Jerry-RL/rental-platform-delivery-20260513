import { createContext, useContext, useState, type ReactNode } from "react";
import { useAdminCoreFlow } from "../hooks/useAdminCoreFlow";
import { useAdminOpsFlow } from "../hooks/useAdminOpsFlow";

type AdminFlowContextValue = {
  message: string;
  setMessage: (value: string) => void;
  core: ReturnType<typeof useAdminCoreFlow>;
  ops: ReturnType<typeof useAdminOpsFlow>;
};

const AdminFlowContext = createContext<AdminFlowContextValue | null>(null);

export function AdminFlowProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const core = useAdminCoreFlow(setMessage);
  const ops = useAdminOpsFlow(core.headers, setMessage);

  return <AdminFlowContext.Provider value={{ message, setMessage, core, ops }}>{children}</AdminFlowContext.Provider>;
}

export function useAdminFlowContext() {
  const context = useContext(AdminFlowContext);
  if (!context) {
    throw new Error("useAdminFlowContext must be used within AdminFlowProvider");
  }
  return context;
}
