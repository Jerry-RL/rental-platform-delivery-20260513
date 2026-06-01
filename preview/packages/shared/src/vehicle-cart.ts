import { normalizePerVehicleServiceMode } from "./service-mode";
import { resolveVehicleImageUrl, vehicleImageSeed } from "./vehicle-images";
import type { PerVehicleServiceMode, Vehicle } from "./types";

export const VEHICLE_CART_MAX = 20;

export const VEHICLE_CART_STORAGE_KEY = "rental-preview-h5-vehicle-cart";

export type VehicleCartItem = {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  vehicleTypeId: string;
  dailyPrice: number;
  imageUrl: string;
  city: string;
  /** 该车是否包车带司机（默认自驾；混合服务由篮内多车组合） */
  serviceMode: PerVehicleServiceMode;
};

export type VehicleCartSnapshot = {
  city: string;
  items: VehicleCartItem[];
  updatedAt: string;
};

const normalizeCartItem = (raw: VehicleCartItem): VehicleCartItem => ({
  ...raw,
  serviceMode: normalizePerVehicleServiceMode(raw.serviceMode),
  imageUrl: resolveVehicleImageUrl(raw.imageUrl, {
    vehicleId: raw.vehicleId,
    vehicleTypeId: raw.vehicleTypeId,
    seed: vehicleImageSeed(raw.vehicleId)
  })
});

export const vehicleToCartItem = (
  v: Vehicle,
  city: string,
  serviceMode: PerVehicleServiceMode = "SELF_DRIVE"
): VehicleCartItem => ({
  vehicleId: v.id,
  plateNumber: v.plateNumber,
  brand: v.brand,
  model: v.model,
  vehicleTypeId: v.vehicleTypeId,
  dailyPrice: v.dailyPrice,
  imageUrl: resolveVehicleImageUrl(v.imageUrl, {
    vehicleId: v.id,
    vehicleTypeId: v.vehicleTypeId,
    seed: vehicleImageSeed(v.id)
  }),
  city,
  serviceMode
});

export const readVehicleCart = (): VehicleCartSnapshot => {
  if (typeof localStorage === "undefined") {
    return { city: "", items: [], updatedAt: "" };
  }
  try {
    const raw = localStorage.getItem(VEHICLE_CART_STORAGE_KEY);
    if (!raw) return { city: "", items: [], updatedAt: "" };
    const parsed = JSON.parse(raw) as VehicleCartSnapshot;
    return {
      city: parsed.city ?? "",
      items: Array.isArray(parsed.items)
        ? parsed.items.map((i) => normalizeCartItem(i as VehicleCartItem))
        : [],
      updatedAt: parsed.updatedAt ?? ""
    };
  } catch {
    return { city: "", items: [], updatedAt: "" };
  }
};

export const writeVehicleCart = (snapshot: VehicleCartSnapshot): void => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    VEHICLE_CART_STORAGE_KEY,
    JSON.stringify({ ...snapshot, updatedAt: new Date().toISOString() })
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rental-vehicle-cart-changed"));
  }
};

export const cartDailyTotal = (items: VehicleCartItem[]) =>
  items.reduce((s, i) => s + i.dailyPrice, 0);

export const isVehicleInCart = (vehicleId: string, items: VehicleCartItem[]) =>
  items.some((i) => i.vehicleId === vehicleId);

export type CartMutateResult = { ok: true } | { ok: false; message: string };

export const getCartItem = (vehicleId: string): VehicleCartItem | undefined =>
  readVehicleCart().items.find((i) => i.vehicleId === vehicleId);

export const setCartItemServiceMode = (
  vehicleId: string,
  serviceMode: PerVehicleServiceMode
): void => {
  const snap = readVehicleCart();
  const items = snap.items.map((i) =>
    i.vehicleId === vehicleId ? { ...i, serviceMode } : i
  );
  writeVehicleCart({ ...snap, items });
};

export const setAllCartItemsServiceMode = (serviceMode: PerVehicleServiceMode): void => {
  const snap = readVehicleCart();
  if (!snap.items.length) return;
  writeVehicleCart({
    ...snap,
    items: snap.items.map((i) => ({ ...i, serviceMode }))
  });
};

export const countCartByServiceMode = (items: VehicleCartItem[]) => {
  const selfDrive = items.filter((i) => i.serviceMode === "SELF_DRIVE").length;
  const withDriver = items.filter((i) => i.serviceMode === "WITH_DRIVER").length;
  return {
    selfDrive,
    withDriver,
    isMixed: selfDrive > 0 && withDriver > 0
  };
};

export const addVehicleToCart = (
  vehicle: Vehicle,
  serviceMode: PerVehicleServiceMode = "SELF_DRIVE"
): CartMutateResult => {
  const snap = readVehicleCart();
  const item = vehicleToCartItem(vehicle, vehicle.city, serviceMode);
  if (isVehicleInCart(vehicle.id, snap.items)) return { ok: true };
  if (snap.items.length >= VEHICLE_CART_MAX) {
    return { ok: false, message: `最多选择 ${VEHICLE_CART_MAX} 台车` };
  }
  writeVehicleCart({
    city: snap.city || vehicle.city,
    items: [...snap.items, item],
    updatedAt: ""
  });
  return { ok: true };
};

export const removeVehicleFromCart = (vehicleId: string): void => {
  const snap = readVehicleCart();
  const items = snap.items.filter((i) => i.vehicleId !== vehicleId);
  writeVehicleCart({
    city: items.length ? snap.city : "",
    items,
    updatedAt: ""
  });
};

export const toggleVehicleInCart = (
  vehicle: Vehicle,
  serviceMode: PerVehicleServiceMode = "SELF_DRIVE"
): CartMutateResult => {
  const snap = readVehicleCart();
  if (isVehicleInCart(vehicle.id, snap.items)) {
    removeVehicleFromCart(vehicle.id);
    return { ok: true };
  }
  return addVehicleToCart(vehicle, serviceMode);
};

export const clearVehicleCart = (): void => {
  writeVehicleCart({ city: "", items: [], updatedAt: "" });
};

export const setVehicleCartCity = (city: string): void => {
  const snap = readVehicleCart();
  if (!snap.items.length) return;
  writeVehicleCart({ ...snap, city });
};
