import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  api,
  getPreviewUserId,
  licenseRoleLabel,
  licenseStatusLabel,
  licenseVerifyStatusLabel,
  SERVICE_MODE_META,
  type EligibilitySnapshot,
  type SubmitLicenseRequest,
  type UserLicenseRecord
} from "@rental-preview/shared";
import { SectionCard } from "../components/SectionCard";
import { cn } from "../lib/utils";

const DEMO_IMAGE = "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600";

const LicenseImageSlot = ({
  label,
  url,
  onPick
}: {
  label: string;
  url?: string;
  onPick: (dataUrl: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onPick(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <button
        type="button"
        className="mt-1 flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 py-4"
        onClick={() => inputRef.current?.click()}
      >
        {url ? (
          <img src={url} alt={label} className="h-28 w-full object-cover" />
        ) : (
          <span className="text-sm text-muted-foreground">点击上传照片</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        className="mt-1 text-[10px] text-primary"
        onClick={() => onPick(DEMO_IMAGE)}
      >
        使用演示样张
      </button>
    </div>
  );
};

export function LicensePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromBooking = searchParams.get("from") === "booking";
  const vehicleIdParam = searchParams.get("vehicleId") ?? "";
  const plateNumberParam = searchParams.get("plateNumber") ?? "";
  const isDriverScope = Boolean(vehicleIdParam);
  const userId = getPreviewUserId();
  const [record, setRecord] = useState<UserLicenseRecord | null>(null);
  const [eligibility, setEligibility] = useState<EligibilitySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<SubmitLicenseRequest>({
    licenseNo: "",
    licenseClass: "C1",
    issueDate: "2018-06-01",
    expiryDate: "2028-06-30",
    licenseImageUrl: DEMO_IMAGE,
    licenseImageBackUrl: DEMO_IMAGE,
    driverName: ""
  });

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const licenseUrl = isDriverScope
      ? `/api/v1/users/${userId}/license?vehicleId=${encodeURIComponent(vehicleIdParam)}`
      : `/api/v1/users/${userId}/license`;
    const eligQs = isDriverScope
      ? `serviceMode=SELF_DRIVE&selfDriveVehicleIds=${encodeURIComponent(vehicleIdParam)}`
      : "serviceMode=SELF_DRIVE";
    const [licRes, eligRes] = await Promise.all([
      api.get<UserLicenseRecord | null>(licenseUrl),
      api.get<EligibilitySnapshot>(`/api/v1/users/${userId}/eligibility?${eligQs}`)
    ]);
    setLoading(false);
    if (licRes.ok) setRecord(licRes.data);
    if (eligRes.ok && eligRes.data) setEligibility(eligRes.data);
    if (licRes.data) {
      setForm({
        licenseNo: licRes.data.licenseNo,
        licenseClass: licRes.data.licenseClass,
        issueDate: licRes.data.issueDate,
        expiryDate: licRes.data.expiryDate,
        licenseImageUrl: licRes.data.licenseImageUrl ?? DEMO_IMAGE,
        licenseImageBackUrl: licRes.data.licenseImageBackUrl ?? DEMO_IMAGE,
        driverName: licRes.data.driverName ?? "",
        vehicleId: licRes.data.vehicleId,
        plateNumber: licRes.data.plateNumber
      });
    }
  }, [userId, isDriverScope, vehicleIdParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async () => {
    if (!userId) return;
    if (isDriverScope && !form.driverName?.trim()) {
      setMsg("请填写本次自驾司机姓名");
      return;
    }
    if (!form.licenseNo.trim()) {
      setMsg("请填写驾驶证号");
      return;
    }
    if (!form.licenseImageUrl || !form.licenseImageBackUrl) {
      setMsg("请上传驾驶证正反面照片");
      return;
    }
    setSubmitting(true);
    setMsg("");
    const res = await api.post<UserLicenseRecord>(`/api/v1/users/${userId}/license`, {
      ...form,
      role: isDriverScope ? "SELF_DRIVE_DRIVER" : "ACCOUNT_HOLDER",
      vehicleId: isDriverScope ? vehicleIdParam : undefined,
      plateNumber: isDriverScope ? plateNumberParam || undefined : undefined,
      driverName: isDriverScope ? form.driverName?.trim() : undefined
    });
    setSubmitting(false);
    if (!res.ok) {
      setMsg(res.error ?? "提交失败");
      return;
    }
    setMsg(res.raw?.message ?? "已提交，请等待平台审核");
    await load();
    if (fromBooking) {
      setTimeout(() => navigate(-1), 1200);
    }
  };

  const canEdit = !record || record.verifyStatus === "REJECTED";

  const handleBack = () => {
    if (fromBooking) navigate(-1);
    else navigate("/me");
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      <button type="button" className="text-sm text-primary" onClick={handleBack}>
        ← {fromBooking ? "返回下单" : "返回我的"}
      </button>

      <div>
        <h2 className="text-lg font-bold">
          {isDriverScope ? "本次自驾司机驾照" : "账户本人驾照"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isDriverScope
            ? "上传实际取车驾驶人的驾驶证，与下单账户本人驾照分开审核"
            : "您本人驾驶单台自驾时可使用；多台自驾须为每台车单独登记司机驾照"}
        </p>
        {isDriverScope && plateNumberParam && (
          <p className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
            车辆 <strong>{decodeURIComponent(plateNumberParam)}</strong> · 类型{" "}
            {licenseRoleLabel.SELF_DRIVE_DRIVER}
          </p>
        )}
      </div>

      {!isDriverScope && (
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-2">
            <p className="font-medium">{SERVICE_MODE_META.SELF_DRIVE.title}</p>
            <p className="text-muted-foreground">本人驾车：账户本人驾照</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-2">
            <p className="font-medium">多台自驾</p>
            <p className="text-muted-foreground">下单页按车登记「本次自驾司机」</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : (
        <>
          {record && (
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <p className="font-medium">当前状态</p>
              {record.driverName && (
                <p className="mt-1 text-xs text-muted-foreground">
                  驾驶人 {record.driverName} · {licenseRoleLabel[record.role ?? "SELF_DRIVE_DRIVER"]}
                </p>
              )}
              <p className="mt-2">
                审核：{licenseVerifyStatusLabel[record.verifyStatus]}
                {record.verifyStatus === "APPROVED" && !isDriverScope && (
                  <span className="ml-2 text-muted-foreground">
                    · 证件{licenseStatusLabel[eligibility?.licenseStatus ?? "NONE"]}
                  </span>
                )}
              </p>
              {record.rejectReason && (
                <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-destructive">
                  {record.rejectReason}
                </p>
              )}
            </div>
          )}

          {eligibility && !isDriverScope && (
            <p
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                eligibility.eligible ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              )}
            >
              本人自驾资格：{eligibility.message}
            </p>
          )}

          {canEdit ? (
            <SectionCard
              title={isDriverScope ? "登记自驾司机驾照" : "上传本人驾驶证"}
              description={
                isDriverScope
                  ? "须为实际驾驶该台车的人员，证件信息与其驾照一致"
                  : "请上传正反面清晰照片，信息须与证件一致"
              }
            >
              {isDriverScope && (
                <label className="block text-xs text-muted-foreground">
                  本次自驾司机姓名
                  <input
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={form.driverName ?? ""}
                    placeholder="实际取车驾驶人"
                    onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
                  />
                </label>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <LicenseImageSlot
                  label="驾驶证正面"
                  url={form.licenseImageUrl}
                  onPick={(url) => setForm((f) => ({ ...f, licenseImageUrl: url }))}
                />
                <LicenseImageSlot
                  label="驾驶证副页"
                  url={form.licenseImageBackUrl}
                  onPick={(url) => setForm((f) => ({ ...f, licenseImageBackUrl: url }))}
                />
              </div>
              <label className="block text-xs text-muted-foreground">
                驾驶证号
                <input
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={form.licenseNo}
                  onChange={(e) => setForm((f) => ({ ...f, licenseNo: e.target.value }))}
                  placeholder="与证件一致"
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                准驾车型
                <select
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={form.licenseClass}
                  onChange={(e) => setForm((f) => ({ ...f, licenseClass: e.target.value }))}
                >
                  {["C1", "C2", "B1", "B2", "A1", "A2"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                初次领证日期
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={form.issueDate}
                  onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                />
              </label>
              <label className="block text-xs text-muted-foreground">
                有效期至
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                />
              </label>
              <button
                type="button"
                disabled={submitting}
                className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                onClick={() => void handleSubmit()}
              >
                {submitting
                  ? "提交中…"
                  : isDriverScope
                    ? "提交司机驾照认证"
                    : "提交本人驾照认证"}
              </button>
            </SectionCard>
          ) : (
            <p className="text-sm text-muted-foreground">
              {record?.verifyStatus === "PENDING"
                ? "审核中，暂不可修改。可在管理端「驾照审核」通过或驳回。"
                : "驾照已通过且有效，无需重复提交。"}
            </p>
          )}
        </>
      )}

      {msg && <p className="text-center text-sm text-primary">{msg}</p>}
    </div>
  );
}
