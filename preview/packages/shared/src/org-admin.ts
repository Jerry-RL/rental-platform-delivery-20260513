import { resolveAccountContext } from "./account-segment";
import type { PreviewStore } from "./store";
import type {
  AccountContext,
  OrgAccount,
  OrgAccountDetail,
  OrgMember,
  OrgMemberEnriched,
  OrgMemberStatus
} from "./types";

export type OrgListQuery = {
  orgName?: string;
  accountType?: string;
  status?: string;
};

export type OrgMemberListQuery = {
  orgId?: string;
  status?: string;
  phone?: string;
  departmentName?: string;
  orgName?: string;
};

export type CreateOrgMemberRequest = {
  orgId: string;
  phone: string;
  realName?: string;
  departmentName?: string;
  roleCodes?: string[] | string;
  dataScope?: OrgMember["dataScope"];
  status?: OrgMemberStatus;
};

export const enrichOrgMember = (store: PreviewStore, member: OrgMember): OrgMemberEnriched => {
  const org = store.orgs.find((o) => o.id === member.orgId);
  const user = store.users.find((u) => u.id === member.userId);
  return {
    ...member,
    orgName: org?.orgName ?? "—",
    accountType: org?.accountType,
    userPhone: user?.phone ?? "—",
    userName: user?.realName ?? "—",
    userStatus: user?.status
  };
};

export const filterOrgs = (orgs: OrgAccount[], q: OrgListQuery): OrgAccount[] => {
  let items = [...orgs];
  if (q.orgName) items = items.filter((o) => o.orgName.includes(q.orgName!));
  if (q.accountType) items = items.filter((o) => o.accountType === q.accountType);
  if (q.status) items = items.filter((o) => o.status === q.status);
  return items;
};

export const filterOrgMembers = (
  store: PreviewStore,
  q: OrgMemberListQuery
): OrgMemberEnriched[] => {
  let items = store.orgMembers.map((m) => enrichOrgMember(store, m));
  if (q.orgId) items = items.filter((m) => m.orgId === q.orgId);
  if (q.status) items = items.filter((m) => m.status === q.status);
  if (q.phone) items = items.filter((m) => m.userPhone.includes(q.phone!));
  if (q.departmentName) items = items.filter((m) => m.departmentName.includes(q.departmentName!));
  if (q.orgName) items = items.filter((m) => m.orgName.includes(q.orgName!));
  return items;
};

export const buildOrgAccountDetail = (store: PreviewStore, orgId: string): OrgAccountDetail | null => {
  const org = store.orgs.find((o) => o.id === orgId);
  if (!org) return null;
  const members = store.orgMembers.filter((m) => m.orgId === orgId).map((m) => enrichOrgMember(store, m));
  const pendingApprovals = store.approvals.filter((a) => a.orgId === orgId && a.status === "PENDING").length;
  const activeMemberCount = members.filter((m) => m.status === "ACTIVE").length;
  const creditUsagePercent =
    org.creditLimit > 0 ? Math.round((org.usedAmount / org.creditLimit) * 1000) / 10 : 0;

  return {
    org,
    members,
    stats: {
      memberCount: members.length,
      activeMemberCount,
      pendingApprovals,
      creditUsagePercent
    }
  };
};

const parseRoleCodes = (raw: string[] | string | undefined): string[] => {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean);
  }
  return ["MEMBER"];
};

export const createOrgMember = (
  store: PreviewStore,
  req: CreateOrgMemberRequest,
  ts: () => string
): { member: OrgMember; createdUser: boolean } => {
  const org = store.orgs.find((o) => o.id === req.orgId);
  if (!org) throw new Error("企业客户不存在");

  const phone = req.phone.trim();
  if (!/^1\d{10}$/.test(phone)) throw new Error("请输入有效手机号");

  let user = store.users.find((u) => u.phone === phone);
  let createdUser = false;
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      phone,
      realName: req.realName?.trim() || org.contactName || "企业用户",
      status: "ACTIVE",
      realNameStatus: "APPROVED",
      licenseStatus: "NONE",
      licenseVerifyStatus: "NONE",
      registeredAt: ts(),
      registrationSource: "ENTERPRISE"
    };
    store.users.unshift(user);
    createdUser = true;
  } else if (req.realName?.trim()) {
    user.realName = req.realName.trim();
  }

  const exists = store.orgMembers.some((m) => m.orgId === req.orgId && m.userId === user!.id);
  if (exists) throw new Error("该用户已在本企业中");

  const member: OrgMember = {
    id: `om-${Date.now()}`,
    orgId: req.orgId,
    userId: user.id,
    departmentName: req.departmentName?.trim() || "默认部门",
    roleCodes: parseRoleCodes(req.roleCodes),
    dataScope: req.dataScope ?? "DEPT",
    status: req.status ?? "ACTIVE"
  };
  store.orgMembers.unshift(member);
  return { member, createdUser };
};

const MOBILE_RE = /^1\d{10}$/;

export const validateMemberContactPhone = (phone: string): { ok: true } | { ok: false; message: string } => {
  const trimmed = phone.trim();
  if (!trimmed) return { ok: false, message: "请填写联系电话" };
  if (!MOBILE_RE.test(trimmed)) return { ok: false, message: "请输入 11 位有效手机号" };
  return { ok: true };
};

/** B/G 成员在 H5 留存审批联系手机 */
export const updateOrgMemberContactPhone = (
  store: PreviewStore,
  userId: string,
  contactPhone: string
): { member: OrgMember; account: AccountContext } => {
  const valid = validateMemberContactPhone(contactPhone);
  if (!valid.ok) throw new Error(valid.message);

  const membership = store.orgMembers.find((m) => m.userId === userId);
  if (!membership) throw new Error("当前用户非企业成员");

  const updated: OrgMember = { ...membership, contactPhone: contactPhone.trim() };
  const idx = store.orgMembers.findIndex((m) => m.id === membership.id);
  if (idx >= 0) store.orgMembers[idx] = updated;

  const account = resolveAccountContext(store, userId);
  if (!account) throw new Error("账号上下文解析失败");
  return { member: updated, account };
};
