import { handleMockRequest } from "./mock-api";
import type { ApiResponse } from "./types";

export type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
  isMock: true;
  raw?: ApiResponse<T>;
};

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
};

const getToken = () => {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("rental_preview_token");
};

export const setPreviewToken = (token: string | null) => {
  if (typeof localStorage === "undefined") return;
  if (token) localStorage.setItem("rental_preview_token", token);
  else localStorage.removeItem("rental_preview_token");
};

export const getPreviewUserId = () => {
  const t = getToken();
  if (!t) return null;
  const m = t.match(/preview-token-(.+)$/);
  return m?.[1] ?? null;
};

export async function previewRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const method = options.method ?? "GET";
  try {
    const raw = await handleMockRequest<T>({
      method,
      path,
      body: options.body,
      userId: getPreviewUserId() ?? undefined
    });
    if (raw.code !== 0) {
      return {
        ok: false,
        data: (raw.data ?? null) as T | null,
        error: raw.message,
        status: raw.code,
        isMock: true,
        raw
      };
    }
    return { ok: true, data: raw.data, error: null, status: 200, isMock: true, raw };
  } catch (e) {
    return {
      ok: false,
      data: null,
      error: e instanceof Error ? e.message : "请求失败",
      status: 500,
      isMock: true
    };
  }
}

export const api = {
  get: <T>(path: string) => previewRequest<T>(path),
  post: <T>(path: string, body?: unknown) => previewRequest<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => previewRequest<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => previewRequest<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => previewRequest<T>(path, { method: "DELETE" })
};
