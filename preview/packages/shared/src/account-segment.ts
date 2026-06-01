import { checkEligibility } from "./eligibility";
import type { PreviewStore } from "./store";
import type {
  AccountContext,
  ClientSegment,
  EligibilitySnapshot,
  OrgAccount,
  OrgMember,
  ServiceMode,
  User
} from "./types";
import { findAccountHolderLicense } from "./multi-license";

const segmentLabel: Record<ClientSegment, string> = {
  C: "C端个人",
  B: "B端企业",
  G: "G端政务"
};

export const pickPrimaryMembership = (
  store: PreviewStore,
  userId: string
): { org: OrgAccount; member: OrgMember } | null => {
  const memberships = store.orgMembers.filter((m) => m.userId === userId);
  if (memberships.length === 0) return null;

  const active = memberships.find((m) => m.status === "ACTIVE");
  const member = active ?? memberships[0];
  const org = store.orgs.find((o) => o.id === member.orgId);
  if (!org) return null;
  return { org, member };
};

const buildBgAuthReasons = (
  user: User,
  org: OrgAccount,
  member: OrgMember
): string[] => {
  const reasons: string[] = [];

  if (org.status !== "ACTIVE") {
    reasons.push(
      org.status === "PENDING"
        ? "企业资质审核中，通过后方可使用租车服务"
        : org.status === "FROZEN"
          ? "企业账户已冻结，暂不可下单"
          : "企业账户已注销，不可使用租车服务"
    );
  }

  if (member.status !== "ACTIVE") {
    reasons.push(
      member.status === "PENDING"
        ? "您的企业成员账号待审批，通过后方可使用租车服务"
        : "您的企业成员账号已停用"
    );
  }

  if (user.realNameStatus !== "APPROVED") {
    reasons.push(
      user.realNameStatus === "PENDING" ? "实名认证审核中" : "请先完成实名认证"
    );
  }

  if (user.status === "BLACKLIST") reasons.push("账户已列入黑名单");
  if (user.status === "SUSPENDED") reasons.push("账户已冻结");

  return reasons;
};

/** 解析当前登录用户属于 C 端还是 B/G 端（以组织成员关系为准） */
export const resolveAccountContext = (store: PreviewStore, userId: string): AccountContext | null => {
  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;

  const membership = pickPrimaryMembership(store, userId);
  if (!membership) {
    return {
      segment: "C",
      segmentLabel: segmentLabel.C,
      requiresOrgAuth: false,
      accountAuthOk: true,
      rentalAllowed: user.status === "ACTIVE",
      message:
        user.status === "ACTIVE"
          ? "C端个人用户：自驾须驾照认证，包车须实名通过"
          : "账户状态异常，暂不可使用租车服务",
      reasons: user.status !== "ACTIVE" ? ["账户状态不可用"] : [],
      realNameStatus: user.realNameStatus
    };
  }

  const { org, member } = membership;
  const reasons = buildBgAuthReasons(user, org, member);
  const accountAuthOk = reasons.length === 0;

  return {
    segment: org.accountType,
    segmentLabel: segmentLabel[org.accountType],
    requiresOrgAuth: true,
    accountAuthOk,
    rentalAllowed: accountAuthOk,
    message: accountAuthOk
      ? `${segmentLabel[org.accountType]}账号已认证，可按授信规则使用租车服务`
      : reasons.join("；"),
    reasons,
    realNameStatus: user.realNameStatus,
    org: {
      id: org.id,
      orgName: org.orgName,
      accountType: org.accountType,
      status: org.status,
      creditLimit: org.creditLimit,
      usedAmount: org.usedAmount
    },
    member: {
      id: member.id,
      status: member.status,
      departmentName: member.departmentName,
      roleCodes: member.roleCodes
    }
  };
};

export const isBgSegment = (segment: ClientSegment): boolean => segment === "B" || segment === "G";

export const accountAuthErrorCode = (ctx: AccountContext): number => {
  if (ctx.org?.status !== "ACTIVE") return 3006;
  if (ctx.member?.status !== "ACTIVE") return 3002;
  if (ctx.realNameStatus !== "APPROVED") return 3004;
  return 3002;
};

/** 合并 B/G 账号认证 + 用车资格（驾照/实名） */
export const buildRentalEligibility = (
  store: PreviewStore,
  userId: string,
  serviceMode: ServiceMode = "SELF_DRIVE"
): EligibilitySnapshot => {
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    return {
      snapshotId: `elig-${Date.now()}`,
      eligible: false,
      realnameStatus: "NONE",
      licenseStatus: "NONE",
      blacklistFlag: false,
      rejectReasons: ["用户不存在"],
      message: "用户不存在"
    };
  }

  const account = resolveAccountContext(store, userId)!;
  const license = findAccountHolderLicense(store.userLicenses, userId);
  const base = checkEligibility({
    user,
    license,
    serviceMode,
    requireRealname: true
  });

  if (account.requiresOrgAuth && !account.accountAuthOk) {
    const reasons = [...account.reasons, ...(base.rejectReasons ?? [])].filter(Boolean);
    return {
      ...base,
      eligible: false,
      orgStatus: account.org?.status,
      rejectReasons: reasons,
      message: account.message
    };
  }

  if (serviceMode === "WITH_DRIVER" && account.segment !== "C") {
    return {
      ...base,
      eligible: base.eligible,
      orgStatus: account.org?.status,
      creditAvailable: account.org
        ? Math.max(0, account.org.creditLimit - account.org.usedAmount)
        : undefined,
      message: base.eligible
        ? `${account.segmentLabel}：包车无需客户驾照，账号已认证可下单`
        : base.message
    };
  }

  return {
    ...base,
    orgStatus: account.org?.status,
    creditAvailable: account.org
      ? Math.max(0, account.org.creditLimit - account.org.usedAmount)
      : undefined,
    message: base.eligible
      ? account.segment === "C"
        ? base.message
        : `${account.segmentLabel}：${base.message}`
      : base.message
  };
};
