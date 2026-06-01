export const toLocalInputValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const fromLocalInputValue = (value: string) => new Date(value).toISOString();

export const addDaysLocal = (days: number, base = new Date()) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toLocalInputValue(d);
};

export const addHoursLocal = (hours: number, base = new Date()) => {
  const d = new Date(base);
  d.setHours(d.getHours() + hours);
  return toLocalInputValue(d);
};

export const isoToLocalInputValue = (iso: string, fallbackDays = 1) => {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(iso)) return iso.slice(0, 16);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return addDaysLocal(fallbackDays);
  return toLocalInputValue(d);
};

export const addDaysFromLocal = (localValue: string, days: number) => {
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return addDaysLocal(days);
  d.setDate(d.getDate() + days);
  return toLocalInputValue(d);
};

export const formatHandoverDisplay = (localValue: string) => {
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return localValue;
  return d.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};
