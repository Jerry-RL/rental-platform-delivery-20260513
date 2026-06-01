import { useCallback, useEffect, useState } from "react";
import {
  api,
  getPreviewUserId,
  resolveAccountContext,
  previewStore,
  type AccountContext,
  type User,
  type UserMeResponse
} from "@rental-preview/shared";

export const useAccountContext = () => {
  const userId = getPreviewUserId();
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountContext | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));

  const refresh = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setAccount(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await api.get<UserMeResponse>("/api/v1/users/me");
    if (res.ok && res.data) {
      setUser(res.data.user);
      setAccount(res.data.account);
    } else {
      const u = previewStore.users.find((x) => x.id === userId) ?? null;
      setUser(u);
      setAccount(u ? resolveAccountContext(previewStore, userId) : null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    userId,
    user,
    account,
    loading,
    refresh,
    isEnterprise: account?.segment === "B" || account?.segment === "G",
    canRent: account?.rentalAllowed ?? false
  };
};
