import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { ImageUploadField } from "./ImageUploadField";
import { cn } from "../../lib/utils";

export type CrudFieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "checkbox" | "image" | "image-gallery";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  /** image-gallery 时关联的封面字段，默认 imageUrl */
  coverKey?: string;
  maxImages?: number;
};

type FormDialogProps = {
  open: boolean;
  title: string;
  fields: CrudFieldDef[];
  initialValues?: Record<string, unknown>;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  submitting?: boolean;
};

export function FormDialog({
  open,
  title,
  fields,
  initialValues = {},
  onClose,
  onSubmit,
  submitting
}: FormDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (open) {
      const next: Record<string, unknown> = {};
      fields.forEach((f) => {
        const v = initialValues[f.key];
        if (f.type === "checkbox") next[f.key] = v !== undefined && v !== null ? v : false;
        else if (f.type === "image-gallery") {
          const coverKey = f.coverKey ?? "imageUrl";
          const cover = initialValues[coverKey];
          const arr = initialValues[f.key];
          next[f.key] =
            Array.isArray(arr) && arr.length > 0
              ? arr
              : cover
                ? [String(cover)]
                : [];
          next[coverKey] = String(cover ?? (next[f.key] as string[])[0] ?? "");
        } else next[f.key] = v !== undefined && v !== null ? v : "";
      });
      setValues(next);
    }
  }, [open, initialValues, fields]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const out: Record<string, unknown> = { ...values };
    fields.forEach((f) => {
      if (f.type === "number" && out[f.key] !== "") out[f.key] = Number(out[f.key]);
      if (f.type === "checkbox") out[f.key] = Boolean(out[f.key]);
    });
    void onSubmit(out);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-lg">
        <h3 className="text-base font-semibold">{title}</h3>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {fields.map((f) => (
            <label key={f.key} className="block text-xs text-muted-foreground">
              {f.label}
              {f.required && <span className="text-destructive"> *</span>}
              {f.type === "image" ? (
                <ImageUploadField
                  value={String(values[f.key] ?? "")}
                  onChange={(url) => setValues((v) => ({ ...v, [f.key]: url }))}
                  label={f.label}
                />
              ) : f.type === "image-gallery" ? (
                <ImageUploadField
                  multiple
                  maxCount={f.maxImages ?? 5}
                  value={String(values[f.coverKey ?? "imageUrl"] ?? "")}
                  values={(values[f.key] as string[]) ?? []}
                  onChange={(url) =>
                    setValues((v) => ({
                      ...v,
                      [f.coverKey ?? "imageUrl"]: url
                    }))
                  }
                  onValuesChange={(urls) =>
                    setValues((v) => ({
                      ...v,
                      [f.key]: urls,
                      [f.coverKey ?? "imageUrl"]: urls[0] ?? ""
                    }))
                  }
                  label={f.label}
                />
              ) : f.type === "select" ? (
                <Select
                  wrapperClassName="mt-1"
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  required={f.required}
                  placeholder="请选择"
                  options={f.options ?? []}
                />
              ) : f.type === "textarea" ? (
                <textarea
                  className={cn(
                    "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm",
                    "transition-[color,background-color,border-color,box-shadow]",
                    "hover:border-muted-foreground/40 hover:bg-accent/30",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                  rows={3}
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              ) : f.type === "checkbox" ? (
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={Boolean(values[f.key])}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.checked }))}
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  className={cn(
                    "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm",
                    "transition-[color,background-color,border-color,box-shadow]",
                    "hover:border-muted-foreground/40 hover:bg-accent/30",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}
            </label>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "保存中…" : "保存"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
