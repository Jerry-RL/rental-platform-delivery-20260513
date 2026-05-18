import { API_BASE, ENABLE_MOCK_FALLBACK, USE_MOCK_MODE } from "../config/runtime";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: Method;
  headers?: HeadersInit;
  body?: unknown;
};

type RequestWithMockOptions<T> = RequestOptions & {
  mockData: T;
};

export type ApiResult<T> = {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
  isMock?: boolean;
};

const normalizePath = (path: string) => {
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
};

const getMessageFromPayload = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  return fallback;
};

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const url = normalizePath(path);
  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: options.headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        data: null,
        error: getMessageFromPayload(payload, "请求失败"),
        status: response.status
      };
    }

    const data =
      payload && typeof payload === "object" && "data" in payload ? ((payload as { data: T }).data ?? null) : (payload as T);
    return {
      ok: true,
      data,
      error: null,
      status: response.status
    };
  } catch {
    return {
      ok: false,
      data: null,
      error: "网络异常，请稍后重试",
      status: 0
    };
  }
}

export async function requestJsonWithMock<T>(
  path: string,
  options: RequestWithMockOptions<T>
): Promise<ApiResult<T>> {
  if (USE_MOCK_MODE) {
    return {
      ok: true,
      data: options.mockData,
      error: null,
      status: 200,
      isMock: true
    };
  }

  const result = await requestJson<T>(path, options);
  if (result.ok) return result;

  if (ENABLE_MOCK_FALLBACK) {
    return {
      ok: true,
      data: options.mockData,
      error: result.error,
      status: 200,
      isMock: true
    };
  }
  return result;
}
