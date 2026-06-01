import { checkEligibility, type EligibilityCheckInput } from "./eligibility";
import type {
  EligibilitySnapshot,
  LicenseSlotStatus,
  LicenseVehicleSlot,
  User,
  UserLicenseRecord,
  UserLicenseRole
} from "./types";

const isExpired = (expiryDate?: string) => {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date(new Date().toISOString().slice(0, 10));
};

export type SelfDriveVehicleRef = {
  vehicleId: string;
  plateNumber?: string;
};

export const licenseRoleLabel: Record<UserLicenseRole, string> = {
  ACCOUNT_HOLDER: "账户本人",
  SELF_DRIVE_DRIVER: "本次自驾司机"
};

/** 订单内本次自驾司机驾照（按车绑定） */
export const isSelfDriveDriverLicense = (l: UserLicenseRecord) =>
  l.role === "SELF_DRIVE_DRIVER" || Boolean(l.vehicleId);

/** 账户下单人本人驾照（单人自驾可沿用） */
export const isAccountHolderLicense = (l: UserLicenseRecord) =>
  l.role === "ACCOUNT_HOLDER" || (!l.role && !l.vehicleId);

export const listUserLicenses = (licenses: UserLicenseRecord[], userId: string) =>
  licenses.filter((l) => l.userId === userId);

export const findAccountHolderLicense = (licenses: UserLicenseRecord[], userId: string) =>
  listUserLicenses(licenses, userId).find(isAccountHolderLicense);

export const findSelfDriveDriverLicense = (
  licenses: UserLicenseRecord[],
  userId: string,
  vehicleId: string
) =>
  listUserLicenses(licenses, userId).find(
    (l) => l.vehicleId === vehicleId && isSelfDriveDriverLicense(l)
  );

/**
 * 解析某台自驾用车资格所用驾照：
 * - 多台自驾：仅认该车登记的「本次自驾司机」驾照
 * - 单台自驾：优先司机驾照，否则可沿用账户本人驾照
 */
export const resolveSelfDriveLicense = (
  licenses: UserLicenseRecord[],
  userId: string,
  vehicleId: string,
  requireDriverLicenseOnly: boolean
): UserLicenseRecord | undefined => {
  const driverLic = findSelfDriveDriverLicense(licenses, userId, vehicleId);
  if (driverLic) return driverLic;
  if (requireDriverLicenseOnly) return undefined;
  return findAccountHolderLicense(licenses, userId);
};

export const licenseSlotStatus = (license?: UserLicenseRecord | null): LicenseSlotStatus => {
  if (!license || license.verifyStatus === "NONE") return "NONE";
  if (license.verifyStatus === "PENDING") return "PENDING";
  if (license.verifyStatus === "REJECTED") return "REJECTED";
  if (license.verifyStatus === "APPROVED" && isExpired(license.expiryDate)) return "EXPIRED";
  if (license.verifyStatus === "APPROVED") return "VALID";
  return "NONE";
};

const slotStatusMessage = (
  status: LicenseSlotStatus,
  license: UserLicenseRecord | undefined,
  requireDriver: boolean
) => {
  const who = license?.driverName ? `驾驶人 ${license.driverName}` : "本次自驾司机";
  switch (status) {
    case "VALID":
      return `${who} · ${license?.licenseClass ?? ""} · 至 ${license?.expiryDate ?? ""}`;
    case "PENDING":
      return `${who} 驾照审核中，通过后方可取车`;
    case "REJECTED":
      return license?.rejectReason ?? `${who} 驾照被驳回，请重新提交`;
    case "EXPIRED":
      return `${who} 驾照已过期，请更新`;
    default:
      return requireDriver
        ? `请登记${who}的驾驶证（与账户本人驾照分开）`
        : "请上传本次自驾司机或本人驾驶证";
  }
};

export const buildLicenseVehicleSlot = (
  ref: SelfDriveVehicleRef,
  license: UserLicenseRecord | undefined,
  licenses: UserLicenseRecord[],
  userId: string,
  requireDriverLicenseOnly: boolean
): LicenseVehicleSlot => {
  const resolved =
    license ??
    resolveSelfDriveLicense(licenses, userId, ref.vehicleId, requireDriverLicenseOnly);
  const slotStatus = licenseSlotStatus(resolved);
  return {
    vehicleId: ref.vehicleId,
    plateNumber: ref.plateNumber,
    driverName: resolved?.driverName,
    licenseId: resolved?.id,
    licenseNo: resolved?.licenseNo,
    slotStatus,
    message: slotStatusMessage(slotStatus, resolved, requireDriverLicenseOnly)
  };
};

export const countValidSelfDriveLicenses = (slots: LicenseVehicleSlot[]) =>
  slots.filter((s) => s.slotStatus === "VALID").length;

/** 多台自驾：每台车须登记一名自驾司机及其驾照 */
export const checkMultiSelfDriveEligibility = (
  user: User,
  licenses: UserLicenseRecord[],
  vehicles: SelfDriveVehicleRef[]
): EligibilitySnapshot => {
  const requiredLicenseCount = vehicles.length;
  const driverOnly = requiredLicenseCount > 1;

  if (requiredLicenseCount === 0) {
    const primary = findAccountHolderLicense(licenses, user.id);
    return checkEligibility({ user, license: primary, serviceMode: "SELF_DRIVE" });
  }

  if (requiredLicenseCount === 1) {
    const lic = resolveSelfDriveLicense(licenses, user.id, vehicles[0].vehicleId, false);
    const base = checkEligibility({ user, license: lic, serviceMode: "SELF_DRIVE" });
    const slots = [
      buildLicenseVehicleSlot(vehicles[0], lic, licenses, user.id, false)
    ];
    const msg =
      base.eligible && lic && isSelfDriveDriverLicense(lic)
        ? `已登记本次自驾司机 ${lic.driverName ?? ""}，可下单`
        : base.eligible
          ? "自驾资格校验通过（本人或已登记司机驾照）"
          : base.message;
    return {
      ...base,
      message: msg,
      selfDriveVehicleCount: 1,
      requiredLicenseCount: 1,
      approvedLicenseCount: countValidSelfDriveLicenses(slots),
      licenseSlots: slots
    };
  }

  const licenseSlots = vehicles.map((v) =>
    buildLicenseVehicleSlot(v, undefined, licenses, user.id, true)
  );
  const approvedLicenseCount = countValidSelfDriveLicenses(licenseSlots);
  const allSlotsValid = approvedLicenseCount === requiredLicenseCount;

  const reasons: string[] = [];
  if (user.status === "BLACKLIST") reasons.push("账户已列入黑名单");
  if (user.status === "SUSPENDED") reasons.push("账户已冻结");
  if (user.realNameStatus !== "APPROVED") {
    reasons.push(
      user.realNameStatus === "PENDING" ? "实名认证审核中" : "请先完成实名认证"
    );
  }
  if (!allSlotsValid) {
    const pending = licenseSlots.filter((s) => s.slotStatus !== "VALID").length;
    reasons.push(
      `自驾 ${requiredLicenseCount} 台车须为每台车登记一名自驾司机并上传其驾照（非账户本人驾照），尚有 ${pending} 台未完成`
    );
  }

  const firstInvalid = licenseSlots.find((s) => s.slotStatus !== "VALID");
  const primaryLicense = firstInvalid?.licenseId
    ? licenses.find((l) => l.id === firstInvalid.licenseId)
    : findSelfDriveDriverLicense(licenses, user.id, vehicles[0].vehicleId);

  return {
    snapshotId: `elig-multi-${Date.now()}`,
    eligible: reasons.length === 0,
    realnameStatus: user.realNameStatus,
    licenseStatus: allSlotsValid ? "VALID" : "NONE",
    licenseVerifyStatus: primaryLicense?.verifyStatus ?? "NONE",
    licenseExpiryDate: primaryLicense?.expiryDate,
    licenseClass: primaryLicense?.licenseClass,
    blacklistFlag: user.status === "BLACKLIST",
    rejectReasons: reasons,
    message:
      reasons.length > 0
        ? reasons.join("；")
        : `自驾 ${requiredLicenseCount} 台车，${requiredLicenseCount} 名自驾司机驾照均已通过`,
    selfDriveVehicleCount: requiredLicenseCount,
    requiredLicenseCount,
    approvedLicenseCount,
    licenseSlots
  };
};

export const gateSelfDriveForVehicle = (
  input: EligibilityCheckInput & {
    vehicleId?: string;
    licenses: UserLicenseRecord[];
    /** 是否仅接受该车登记的自驾司机驾照（批量下单时 true） */
    driverLicenseOnly?: boolean;
  }
): EligibilitySnapshot => {
  const { user, licenses, vehicleId, serviceMode = "SELF_DRIVE", driverLicenseOnly = false } =
    input;
  if (serviceMode !== "SELF_DRIVE" && serviceMode !== "MIXED") {
    return checkEligibility({ user, license: null, serviceMode });
  }
  const license = vehicleId
    ? resolveSelfDriveLicense(licenses, user.id, vehicleId, driverLicenseOnly)
    : findAccountHolderLicense(licenses, user.id);
  return checkEligibility({ user, license, serviceMode });
};

export const parseSelfDriveVehicleIds = (raw?: string) =>
  (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
