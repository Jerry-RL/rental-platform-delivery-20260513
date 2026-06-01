import { useEffect, useState } from "react";
import {
  api,
  RENTAL_COMPANY_CONTACT,
  type AccountContext,
  type UpdateOrgMemberContactRequest,
  type UserMeResponse
} from "@rental-preview/shared";

type OrgAuthContactSectionProps = {
  account: AccountContext;
  loginPhone?: string;
  onSaved?: (account: AccountContext) => void;
};

export const OrgAuthContactSection = ({
  account,
  loginPhone,
  onSaved
}: OrgAuthContactSectionProps) => {
  const initial =
    account.member?.contactPhone?.trim() || loginPhone?.trim() || "";
  const [phone, setPhone] = useState(initial);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhone(account.member?.contactPhone?.trim() || loginPhone?.trim() || "");
  }, [account.member?.contactPhone, loginPhone]);

  const handleSave = async () => {
    setMsg("");
    setLoading(true);
    const payload: UpdateOrgMemberContactRequest = { contactPhone: phone.trim() };
    const res = await api.put<UserMeResponse>("/api/v1/users/me/org-contact", payload);
    setLoading(false);
    if (!res.ok || !res.data) {
      setMsg(res.error ?? "保存失败");
      return;
    }
    setMsg(res.raw?.message ?? "已保存");
    onSaved?.(res.data.account);
  };

  if (!account.org || !account.member) return null;

  const companyTel = RENTAL_COMPANY_CONTACT.servicePhone.replace(/-/g, "");

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs">
        <p className="font-medium text-foreground">{RENTAL_COMPANY_CONTACT.companyName}</p>
        <p className="mt-1 text-muted-foreground">
          认证、开通、违章咨询可直接致电租车公司：
        </p>
        <a
          href={`tel:${companyTel}`}
          className="mt-1 inline-block text-base font-semibold text-primary"
          aria-label={`致电租车公司客服 ${RENTAL_COMPANY_CONTACT.servicePhone}`}
        >
          {RENTAL_COMPANY_CONTACT.servicePhone}
        </a>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {RENTAL_COMPANY_CONTACT.serviceHours}
        </p>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          所属企业对接人：{account.org.contactName} ·{" "}
          <a href={`tel:${account.org.contactPhone}`} className="text-primary">
            {account.org.contactPhone}
          </a>
        </p>
      </div>

      <div>
        <label htmlFor="org-member-contact" className="text-xs font-medium text-foreground">
          或留下您的联系电话
        </label>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          不便致电时，可填写号码由运营回电（可与登录手机号不同）
        </p>
        <input
          id="org-member-contact"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={11}
          placeholder="11 位手机号"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          aria-label="企业认证联系电话"
        />
      </div>

      {msg && (
        <p
          className={`text-xs ${msg.includes("已保存") || msg.includes("保存") ? "text-success" : "text-destructive"}`}
        >
          {msg}
        </p>
      )}

      <button
        type="button"
        disabled={loading || phone.length < 11}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        onClick={() => void handleSave()}
      >
        {loading ? "保存中…" : "保存联系电话"}
      </button>
    </div>
  );
};
