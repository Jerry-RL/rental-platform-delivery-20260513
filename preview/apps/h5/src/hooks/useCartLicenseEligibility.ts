import { useCallback, useEffect, useMemo, useState } from "react";
import {
  api,
  getPreviewUserId,
  type EligibilitySnapshot,
  type PerVehicleServiceMode,
  type Vehicle
} from "@rental-preview/shared";

export const useCartLicenseEligibility = (
  selfDriveVehicles: Vehicle[],
  getLineMode: (vehicleId: string) => PerVehicleServiceMode
) => {
  const userId = getPreviewUserId();
  const [eligibility, setEligibility] = useState<EligibilitySnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const selfDriveOnly = useMemo(
    () => selfDriveVehicles.filter((v) => getLineMode(v.id) === "SELF_DRIVE"),
    [selfDriveVehicles, getLineMode]
  );
  const selfDriveIdsKey = selfDriveOnly.map((v) => v.id).join(",");

  const reload = useCallback(async () => {
    if (!userId || selfDriveOnly.length === 0) {
      setEligibility(null);
      return;
    }
    setLoading(true);
    const qs = new URLSearchParams({ serviceMode: "SELF_DRIVE" });
    if (selfDriveOnly.length > 1) {
      qs.set("selfDriveVehicleIds", selfDriveIdsKey);
    }
    const res = await api.get<EligibilitySnapshot>(
      `/api/v1/users/${userId}/eligibility?${qs}`
    );
    setLoading(false);
    if (res.ok && res.data) setEligibility(res.data);
  }, [userId, selfDriveOnly.length, selfDriveIdsKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const onFocus = () => void reload();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reload]);

  return {
    eligibility,
    loading,
    selfDriveOnly,
    reload,
    needsMultiLicense: selfDriveOnly.length > 1,
    allSelfDriveLicensed: selfDriveOnly.length === 0 || (eligibility?.eligible ?? false)
  };
};
