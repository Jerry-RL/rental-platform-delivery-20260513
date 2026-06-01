import {
  addDaysFromLocal,
  addHoursLocal,
  formatHandoverDisplay,
  toLocalInputValue,
  type Store
} from "@rental-preview/shared";
import { SectionCard } from "./SectionCard";
import { cn } from "../lib/utils";

type HandoverScheduleSectionProps = {
  pickupTime: string;
  returnTime: string;
  onPickupTimeChange: (value: string) => void;
  onReturnTimeChange: (value: string) => void;
  pickupStoreId: string;
  returnStoreId: string;
  onPickupStoreChange: (storeId: string) => void;
  onReturnStoreChange: (storeId: string) => void;
  pickupStoreOptions: Store[];
  returnStoreOptions: Store[];
  sameStoreReturn: boolean;
  onSameStoreReturnChange: (checked: boolean) => void;
  durationDays?: number;
  durationHours?: number;
};

const atDayTime = (dayOffset: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return toLocalInputValue(d);
};

const PICKUP_TIME_PRESETS = [
  { id: "tomorrow9", label: "明日 09:00", apply: () => atDayTime(1, 9) },
  { id: "tomorrow14", label: "明日 14:00", apply: () => atDayTime(1, 14) },
  { id: "soon", label: "约 2 小时后", apply: () => addHoursLocal(2) },
  { id: "in3d", label: "3 天后 10:00", apply: () => atDayTime(3, 10) }
] as const;

export const HandoverScheduleSection = ({
  pickupTime,
  returnTime,
  onPickupTimeChange,
  onReturnTimeChange,
  pickupStoreId,
  returnStoreId,
  onPickupStoreChange,
  onReturnStoreChange,
  pickupStoreOptions,
  returnStoreOptions,
  sameStoreReturn,
  onSameStoreReturnChange,
  durationDays,
  durationHours
}: HandoverScheduleSectionProps) => {
  const pickupStore = pickupStoreOptions.find((s) => s.id === pickupStoreId);
  const returnStore = returnStoreOptions.find((s) => s.id === returnStoreId);

  return (
    <SectionCard
      title="预定交车时间与地点"
      description="交车 = 取车；还车时间地点可同店或另选（异店/异地可能加收费用）"
    >
      <div className="rounded-xl border border-border bg-muted/40 p-3">
        <p className="text-xs font-medium text-foreground">交车时间</p>
        <input
          type="datetime-local"
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          value={pickupTime}
          aria-label="预定交车时间"
          onChange={(e) => onPickupTimeChange(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PICKUP_TIME_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="rounded-full bg-background px-2.5 py-1 text-[10px] text-muted-foreground ring-1 ring-border hover:text-primary"
              onClick={() => onPickupTimeChange(p.apply())}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          已选：{formatHandoverDisplay(pickupTime)}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground">还车时间</p>
        <input
          type="datetime-local"
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          value={returnTime}
          aria-label="预定还车时间"
          min={pickupTime}
          onChange={(e) => onReturnTimeChange(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { d: 1, label: "+1 天" },
            { d: 3, label: "+3 天" },
            { d: 7, label: "+7 天" },
            { d: 30, label: "+30 天" }
          ].map((p) => (
            <button
              key={p.d}
              type="button"
              className="rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary"
              onClick={() => onReturnTimeChange(addDaysFromLocal(pickupTime, p.d))}
            >
              {p.label}
            </button>
          ))}
        </div>
        {durationDays !== undefined && (
          <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs">
            计划租期 <strong>{durationDays}</strong> 天
            {durationHours !== undefined ? `（${durationHours} 小时）` : ""}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-xs font-medium text-foreground">交车地点（取车门店）</p>
        <select
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          value={pickupStoreId}
          aria-label="交车地点"
          onChange={(e) => onPickupStoreChange(e.target.value)}
        >
          {pickupStoreOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.city} · {s.name}
            </option>
          ))}
        </select>
        {pickupStore && (
          <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
            <p>{pickupStore.address}</p>
            <p>联系电话 {pickupStore.phone}</p>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={sameStoreReturn}
          onChange={(e) => onSameStoreReturnChange(e.target.checked)}
        />
        同店还车（还车地点与交车地点相同）
      </label>

      {!sameStoreReturn && (
        <div className="rounded-xl border border-dashed border-border p-3">
          <p className="text-xs font-medium text-foreground">还车地点</p>
          <select
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            value={returnStoreId}
            aria-label="还车地点"
            onChange={(e) => onReturnStoreChange(e.target.value)}
          >
            {returnStoreOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city} · {s.name}
              </option>
            ))}
          </select>
          {returnStore && (
            <p className="mt-2 text-[11px] text-muted-foreground">{returnStore.address}</p>
          )}
        </div>
      )}

      {pickupStore && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-xs",
            sameStoreReturn || pickupStoreId === returnStoreId
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning"
          )}
        >
          {sameStoreReturn || pickupStoreId === returnStoreId
            ? `交还同店：${pickupStore.city} · ${pickupStore.name}`
            : `交车 ${pickupStore.city} · ${returnStore?.city ?? "—"} 还车（可能产生异店/异地费）`}
        </p>
      )}
    </SectionCard>
  );
};
