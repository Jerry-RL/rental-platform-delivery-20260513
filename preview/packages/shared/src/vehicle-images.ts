import type { Vehicle } from "./types";

/** 不可靠的外链（国内/演示环境常无法加载） */
const UNRELIABLE_IMAGE_HOSTS = [
  "images.unsplash.com",
  "unsplash.com",
  "source.unsplash.com"
] as const;

const svgDataUrl = (label: string, bg: string, body: string, wheel: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <rect x="48" y="128" width="304" height="72" rx="14" fill="${body}" opacity="0.92"/>
  <rect x="88" y="108" width="140" height="36" rx="8" fill="${body}" opacity="0.75"/>
  <circle cx="108" cy="218" r="26" fill="${wheel}"/><circle cx="292" cy="218" r="26" fill="${wheel}"/>
  <circle cx="108" cy="218" r="12" fill="#64748b"/><circle cx="292" cy="218" r="12" fill="#64748b"/>
  <text x="200" y="56" fill="#f8fafc" font-size="20" font-weight="600" text-anchor="middle" font-family="system-ui,sans-serif">${label}</text>
  <text x="200" y="82" fill="#94a3b8" font-size="12" text-anchor="middle" font-family="system-ui,sans-serif">Preview · 可展示车辆图</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/** 内置可展示车辆图（SVG Data URL，无需外网） */
export const VEHICLE_DISPLAY_IMAGES: string[] = [
  svgDataUrl("SUV", "#1e3a5f", "#3b82f6", "#1e293b"),
  svgDataUrl("轿车", "#312e81", "#6366f1", "#1e293b"),
  svgDataUrl("MPV", "#4c1d95", "#a855f7", "#1e293b"),
  svgDataUrl("新能源", "#134e4a", "#14b8a6", "#1e293b"),
  svgDataUrl("豪华", "#422006", "#f59e0b", "#1e293b"),
  svgDataUrl("经济", "#334155", "#94a3b8", "#1e293b"),
  svgDataUrl("SUV", "#0c4a6e", "#0ea5e9", "#172554"),
  svgDataUrl("轿车", "#1e1b4b", "#818cf8", "#172554"),
  svgDataUrl("商务", "#3f3f46", "#71717a", "#18181b"),
  svgDataUrl("越野", "#14532d", "#22c55e", "#14532d"),
  svgDataUrl("纯电", "#164e63", "#06b6d4", "#0f172a"),
  svgDataUrl("混动", "#365314", "#84cc16", "#1a2e05")
];

const TYPE_IMAGE_INDEX: Record<string, number> = {
  ECONOMY: 5,
  SEDAN: 1,
  SUV: 0,
  MPV: 2,
  NEW_ENERGY: 3,
  LUXURY: 4
};

export const vehicleImageSeed = (id: string, extra = 0): number => {
  let h = extra;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
};

/** 按序号/车型取稳定可展示的图片 URL */
export const getVehicleImageUrl = (seq: number, vehicleTypeId?: string): string => {
  if (vehicleTypeId && TYPE_IMAGE_INDEX[vehicleTypeId] !== undefined) {
    const base = TYPE_IMAGE_INDEX[vehicleTypeId];
    return VEHICLE_DISPLAY_IMAGES[(base + (seq % 3)) % VEHICLE_DISPLAY_IMAGES.length]!;
  }
  return VEHICLE_DISPLAY_IMAGES[Math.abs(seq) % VEHICLE_DISPLAY_IMAGES.length]!;
};

export const isDisplayableImageUrl = (url: string | undefined): boolean => {
  if (!url?.trim()) return false;
  if (url.startsWith("data:image/")) return true;
  if (url.startsWith("/")) return true;
  const lower = url.toLowerCase();
  if (UNRELIABLE_IMAGE_HOSTS.some((h) => lower.includes(h))) return false;
  return lower.startsWith("http://") || lower.startsWith("https://");
};

/**
 * 将爬取/种子中的外链图转为可展示地址：
 * - 保留 data: 上传图、可靠 https
 * - 替换 Unsplash 等不可达链接为内置 SVG
 */
export const resolveVehicleImageUrl = (
  imageUrl: string | undefined,
  opts?: { seed?: number; vehicleTypeId?: string; vehicleId?: string }
): string => {
  if (imageUrl && isDisplayableImageUrl(imageUrl)) return imageUrl;
  const seed =
    opts?.seed ??
    (opts?.vehicleId ? vehicleImageSeed(opts.vehicleId) : 0);
  return getVehicleImageUrl(seed, opts?.vehicleTypeId);
};

export const normalizeVehicleImages = (vehicle: Vehicle): Vehicle => {
  const seed = vehicleImageSeed(vehicle.id);
  const imageUrl = resolveVehicleImageUrl(vehicle.imageUrl, {
    seed,
    vehicleTypeId: vehicle.vehicleTypeId,
    vehicleId: vehicle.id
  });
  const imageUrls = vehicle.imageUrls?.length
    ? vehicle.imageUrls.map((u, i) =>
        resolveVehicleImageUrl(u, {
          seed: seed + i,
          vehicleTypeId: vehicle.vehicleTypeId,
          vehicleId: vehicle.id
        })
      )
    : [imageUrl];
  return {
    ...vehicle,
    imageUrl,
    imageUrls: imageUrls[0] === imageUrl && imageUrls.length === 1 ? imageUrls : imageUrls
  };
};
