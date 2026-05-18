import { createContext, useContext, useState, type ReactNode } from "react";
import { useUserBookingFlow } from "../hooks/useUserBookingFlow";
import { useUserExtensionFlow } from "../hooks/useUserExtensionFlow";

type FlowContextValue = {
  message: string;
  setMessage: (value: string) => void;
  booking: ReturnType<typeof useUserBookingFlow>;
  extension: ReturnType<typeof useUserExtensionFlow>;
};

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const booking = useUserBookingFlow(setMessage);
  const extension = useUserExtensionFlow(booking.authHeader, setMessage);

  return <FlowContext.Provider value={{ message, setMessage, booking, extension }}>{children}</FlowContext.Provider>;
}

export function useFlowContext() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlowContext must be used within FlowProvider");
  }
  return context;
}
