import { pickPrimaryMembership } from "./account-segment";
import type { PreviewStore } from "./store";
import type { User, UserRegistrationSource } from "./types";

export const getUserRegistrationSource = (
  store: PreviewStore,
  user: User
): UserRegistrationSource => {
  if (user.registrationSource) return user.registrationSource;
  return pickPrimaryMembership(store, user.id) ? "ENTERPRISE" : "SELF";
};

export const isCEndUser = (store: PreviewStore, userId: string): boolean =>
  !pickPrimaryMembership(store, userId);

/** C 端须自助注册；B/G 由企业开通成员账号 */
export const canUserLogin = (
  store: PreviewStore,
  user: User
): { ok: true } | { ok: false; code: number; message: string } => {
  if (!isCEndUser(store, user.id)) {
    return { ok: true };
  }
  if (getUserRegistrationSource(store, user) === "SELF") {
    return { ok: true };
  }
  return { ok: false, code: 1001, message: "该手机号未注册，请先注册" };
};

export const validateRegisterRequest = (
  phone: string,
  verifyCode: string
): { ok: true } | { ok: false; message: string } => {
  const p = phone.trim();
  if (!/^1\d{10}$/.test(p)) {
    return { ok: false, message: "请输入有效的 11 位手机号" };
  }
  if (!verifyCode.trim() || verifyCode.trim().length < 4) {
    return { ok: false, message: "请输入验证码（演示可填任意 4 位以上）" };
  }
  return { ok: true };
};
