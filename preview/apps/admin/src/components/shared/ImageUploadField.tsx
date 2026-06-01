import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import {
  api,
  readImageFileAsDataUrl,
  VEHICLE_IMAGE_ACCEPT,
  VEHICLE_IMAGE_MAX_BYTES,
  type UploadImageResult
} from "@rental-preview/shared";
import { cn } from "../../lib/utils";

type ImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  multiple?: boolean;
  values?: string[];
  onValuesChange?: (urls: string[]) => void;
  maxCount?: number;
  disabled?: boolean;
};

export function ImageUploadField({
  value,
  onChange,
  label = "车辆图片",
  multiple = false,
  values = [],
  onValuesChange,
  maxCount = 5,
  disabled
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gallery = multiple ? values : value ? [value] : [];

  const persistToApi = async (local: UploadImageResult) => {
    const res = await api.post<UploadImageResult>("/api/v1/admin/uploads/vehicle-image", {
      dataUrl: local.url,
      fileName: local.fileName,
      mimeType: local.mimeType,
      size: local.size
    });
    if (!res.ok || !res.data) throw new Error(res.error ?? "上传失败");
    return res.data.url;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return;
    setError(null);
    setUploading(true);
    try {
      const picked = Array.from(files).slice(0, multiple ? maxCount - gallery.length : 1);
      const urls: string[] = [];
      for (const file of picked) {
        const local = await readImageFileAsDataUrl(file);
        const url = await persistToApi(local);
        urls.push(url);
      }
      if (multiple && onValuesChange) {
        const next = [...gallery, ...urls].slice(0, maxCount);
        onValuesChange(next);
        onChange(next[0] ?? "");
      } else if (urls[0]) {
        onChange(urls[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    if (!multiple) {
      onChange("");
      return;
    }
    const next = gallery.filter((_, i) => i !== index);
    onValuesChange?.(next);
    onChange(next[0] ?? "");
  };

  return (
    <div className="mt-1 space-y-2">
      <div
        className={cn(
          "relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-input bg-muted/30 px-4 py-6 text-center transition-colors",
          !disabled && "hover:border-primary/50 hover:bg-accent/30",
          disabled && "cursor-not-allowed opacity-60"
        )}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) void handleFiles(e.dataTransfer.files);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        aria-label={label}
      >
        <input
          ref={inputRef}
          type="file"
          accept={VEHICLE_IMAGE_ACCEPT}
          multiple={multiple}
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          点击或拖拽上传 · JPG/PNG/WebP · 单张 ≤{VEHICLE_IMAGE_MAX_BYTES / 1024}KB
        </p>
        <p className="text-[10px] text-muted-foreground">POST /api/v1/admin/uploads/vehicle-image</p>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {gallery.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {gallery.map((url, index) => (
            <div
              key={`${url.slice(0, 32)}-${index}`}
              className="group relative h-20 w-28 overflow-hidden rounded-md border border-border bg-card"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-0 top-0 bg-primary/90 px-1 text-[10px] text-primary-foreground">
                  封面
                </span>
              )}
              {!disabled && (
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-background/80 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="删除图片"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              )}
            </div>
          ))}
          {multiple && gallery.length < maxCount && !disabled && (
            <button
              type="button"
              className="flex h-20 w-28 flex-col items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="h-5 w-5" />
              <span className="mt-1 text-[10px]">添加</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
