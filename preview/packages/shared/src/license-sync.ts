import type { User, UserLicenseRecord } from "./types";

export const applyLicenseToUser = (user: User, license?: UserLicenseRecord | null): User => {
  if (!license) {
    return { ...user, licenseVerifyStatus: "NONE", licenseStatus: "NONE", licenseType: undefined, licenseExpiryDate: undefined };
  }
  const expired = license.expiryDate ? new Date(license.expiryDate) < new Date() : true;
  const licenseStatus =
    license.verifyStatus !== "APPROVED" ? "NONE" : expired ? "EXPIRED" : ("VALID" as const);
  return {
    ...user,
    licenseVerifyStatus: license.verifyStatus,
    licenseStatus: licenseStatus,
    licenseType: license.licenseClass,
    licenseExpiryDate: license.expiryDate
  };
};
