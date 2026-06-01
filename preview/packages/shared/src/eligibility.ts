import type { EligibilitySnapshot, User, UserLicenseRecord } from "./types";

export type EligibilityCheckInput = {
  user: User;
  license?: UserLicenseRecord | null;
  serviceMode?: "SELF_DRIVE" | "WITH_DRIVER" | "MIXED";
  requireRealname?: boolean;
};

const isExpired = (expiryDate?: string) => {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date(new Date().toISOString().slice(0, 10));
};

export const checkEligibility = (input: EligibilityCheckInput): EligibilitySnapshot => {
  const { user, license, serviceMode = "SELF_DRIVE", requireRealname = true } = input;
  const reasons: string[] = [];

  if (user.status === "BLACKLIST") reasons.push("账户已列入黑名单");
  if (user.status === "SUSPENDED") reasons.push("账户已冻结");

  if (requireRealname && user.realNameStatus !== "APPROVED") {
    reasons.push(user.realNameStatus === "PENDING" ? "实名认证审核中" : "请先完成实名认证");
  }

  if (serviceMode === "SELF_DRIVE") {
    if (!license || license.verifyStatus === "NONE") {
      reasons.push("请上传驾驶证并完成认证");
    } else if (license.verifyStatus === "PENDING") {
      reasons.push("驾驶证审核中，通过后方可自驾下单");
    } else if (license.verifyStatus === "REJECTED") {
      reasons.push(license.rejectReason ?? "驾驶证认证被驳回，请重新提交");
    } else if (license.verifyStatus === "APPROVED" && isExpired(license.expiryDate)) {
      reasons.push("驾驶证已过期，请更新证件");
    }
  }

  const licenseStatus =
    !license || license.verifyStatus !== "APPROVED"
      ? "NONE"
      : isExpired(license.expiryDate)
        ? "EXPIRED"
        : "VALID";

  const message =
    reasons.length > 0
      ? reasons.join("；")
      : serviceMode === "WITH_DRIVER"
        ? "包车带司机：无需客户驾照，实名通过即可下单"
        : serviceMode === "MIXED"
          ? "部分带司机+自驾：含自驾须驾照通过，实名通过即可下单"
          : "自驾资格校验通过，可下单";

  return {
    snapshotId: `elig-${Date.now()}`,
    eligible: reasons.length === 0,
    realnameStatus: user.realNameStatus,
    licenseStatus,
    licenseVerifyStatus: license?.verifyStatus ?? "NONE",
    licenseExpiryDate: license?.expiryDate,
    licenseClass: license?.licenseClass,
    blacklistFlag: user.status === "BLACKLIST",
    rejectReasons: reasons,
    message
  };
};

export const eligibilityErrorCode = (snapshot: EligibilitySnapshot): number | null => {
  if (snapshot.eligible) return null;
  if (snapshot.realnameStatus !== "APPROVED") return 3004;
  if (snapshot.licenseStatus === "EXPIRED") return 3003;
  if (snapshot.licenseVerifyStatus === "PENDING") return 3002;
  if (snapshot.licenseVerifyStatus === "REJECTED") return 3002;
  return 3005;
};
