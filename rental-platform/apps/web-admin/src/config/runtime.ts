export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3000/api/v1";

export const USE_MOCK_MODE = String(import.meta.env.VITE_USE_MOCK_MODE ?? "false") === "true";

export const ENABLE_MOCK_FALLBACK = String(import.meta.env.VITE_MOCK_FALLBACK ?? "true") === "true";
