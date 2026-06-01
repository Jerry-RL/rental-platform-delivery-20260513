import { useCallback, useEffect, useState } from "react";
import {
  buildAgreementAcceptPayload,
  isAgreementAccepted,
  RENTAL_AGREEMENT_STORAGE_KEY
} from "@rental-preview/shared";

const readAccepted = () => {
  if (typeof sessionStorage === "undefined") return false;
  return isAgreementAccepted(sessionStorage.getItem(RENTAL_AGREEMENT_STORAGE_KEY));
};

export const useOrderAgreement = () => {
  const [accepted, setAccepted] = useState(readAccepted);

  useEffect(() => {
    setAccepted(readAccepted());
  }, []);

  const accept = useCallback(() => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(RENTAL_AGREEMENT_STORAGE_KEY, buildAgreementAcceptPayload());
    }
    setAccepted(true);
  }, []);

  const clearAcceptance = useCallback(() => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(RENTAL_AGREEMENT_STORAGE_KEY);
    }
    setAccepted(false);
  }, []);

  return { accepted, accept, clearAcceptance, setAccepted };
};
