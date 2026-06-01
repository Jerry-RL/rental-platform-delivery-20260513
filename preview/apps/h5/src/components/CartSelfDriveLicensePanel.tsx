import { useNavigate } from "react-router-dom";
import {
  licenseVerifyStatusLabel,
  type EligibilitySnapshot,
  type LicenseVehicleSlot,
  type Vehicle
} from "@rental-preview/shared";
import { DetailLinkButton } from "./DetailLinkButton";
import { SectionCard } from "./SectionCard";
import { cn } from "../lib/utils";

const slotBadgeClass = (status: LicenseVehicleSlot["slotStatus"]) => {
  switch (status) {
    case "VALID":
      return "bg-success/15 text-success";
    case "PENDING":
      return "bg-warning/15 text-warning";
    case "REJECTED":
    case "EXPIRED":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const slotActionLabel = (status: LicenseVehicleSlot["slotStatus"]) => {
  switch (status) {
    case "VALID":
      return "已通过";
    case "PENDING":
      return "审核中";
    case "REJECTED":
      return "重新提交";
    case "EXPIRED":
      return "更新证件";
    default:
      return "去认证";
  }
};

type CartSelfDriveLicensePanelProps = {
  vehicles: Vehicle[];
  eligibility: EligibilitySnapshot | null;
  loading?: boolean;
};

export const CartSelfDriveLicensePanel = ({
  vehicles,
  eligibility,
  loading
}: CartSelfDriveLicensePanelProps) => {
  const navigate = useNavigate();
  const slots: LicenseVehicleSlot[] =
    eligibility?.licenseSlots ??
    vehicles.map((v) => ({
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      slotStatus: "NONE" as LicenseVehicleSlot["slotStatus"],
      message: "请登记该车自驾司机驾照"
    }));
  const required = eligibility?.requiredLicenseCount ?? vehicles.length;
  const approved = eligibility?.approvedLicenseCount ?? 0;

  if (vehicles.length === 0) return null;

  const multi = vehicles.length > 1;

  return (
    <SectionCard
      title={multi ? "自驾司机驾照（每台车一名驾驶人）" : "自驾司机 / 本人驾照"}
      description={
        multi
          ? `已选 ${vehicles.length} 台自驾，须为每台车登记一名本次自驾司机并上传其驾照（非账户本人驾照）`
          : "单台可登记本次自驾司机驾照，或沿用账户本人驾照"
      }
    >
      {loading ? (
        <p className="text-xs text-muted-foreground">校验用车资格…</p>
      ) : (
        <>
          {multi && (
            <p
              className={cn(
                "rounded-lg px-3 py-2 text-xs",
                approved >= required ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              )}
            >
              已完成 {approved}/{required} 名司机驾照
              {eligibility && !eligibility.eligible ? ` · ${eligibility.message}` : ""}
            </p>
          )}
          <ul className="space-y-2">
            {vehicles.map((v) => {
              const slot = slots.find((s) => s.vehicleId === v.id);
              const status = slot?.slotStatus ?? "NONE";
              const canSubmit = status !== "VALID" && status !== "PENDING";
              return (
                <li
                  key={v.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {v.plateNumber} · {v.brand} {v.model}
                      </p>
                      <DetailLinkButton to={`/vehicles/${v.id}?from=booking`} label="车辆" />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {slot?.message ?? "请登记该车自驾司机驾照"}
                    </p>
                    {slot?.driverName && (
                      <p className="mt-0.5 text-[10px] text-primary">驾驶人 {slot.driverName}</p>
                    )}
                    {slot?.licenseNo && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        证号 {slot.licenseNo.slice(0, 4)}*** ·{" "}
                        {licenseVerifyStatusLabel[
                          status === "VALID"
                            ? "APPROVED"
                            : status === "PENDING"
                              ? "PENDING"
                              : status === "REJECTED"
                                ? "REJECTED"
                                : "NONE"
                        ]}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      slotBadgeClass(status)
                    )}
                  >
                    {slotActionLabel(status)}
                  </span>
                  {canSubmit && (
                    <button
                      type="button"
                      className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                      onClick={() => {
                        const qs = new URLSearchParams({
                          from: "booking",
                          vehicleId: v.id,
                          plateNumber: v.plateNumber
                        });
                        navigate(`/license?${qs}`);
                      }}
                    >
                      登记司机
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </SectionCard>
  );
};
