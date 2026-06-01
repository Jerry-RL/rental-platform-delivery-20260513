import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addVehicleToCart,
  cartDailyTotal,
  clearVehicleCart,
  countCartByServiceMode,
  getCartItem,
  isVehicleInCart,
  readVehicleCart,
  removeVehicleFromCart,
  setAllCartItemsServiceMode,
  setCartItemServiceMode,
  toggleVehicleInCart,
  type CartMutateResult,
  type PerVehicleServiceMode,
  type Vehicle,
  type VehicleCartItem
} from "@rental-preview/shared";

export const useVehicleCart = () => {
  const [items, setItems] = useState<VehicleCartItem[]>(() => readVehicleCart().items);
  const [city, setCity] = useState(() => readVehicleCart().city);

  const sync = useCallback(() => {
    const snap = readVehicleCart();
    setItems(snap.items);
    setCity(snap.city);
  }, []);

  useEffect(() => {
    sync();
    const onChange = () => sync();
    window.addEventListener("rental-vehicle-cart-changed", onChange);
    return () => window.removeEventListener("rental-vehicle-cart-changed", onChange);
  }, [sync]);

  const modeCounts = useMemo(() => countCartByServiceMode(items), [items]);

  const toggle = useCallback(
    (vehicle: Vehicle, serviceMode: PerVehicleServiceMode = "SELF_DRIVE"): CartMutateResult => {
      const res = toggleVehicleInCart(vehicle, serviceMode);
      sync();
      return res;
    },
    [sync]
  );

  const add = useCallback(
    (vehicle: Vehicle, serviceMode: PerVehicleServiceMode = "SELF_DRIVE"): CartMutateResult => {
      const res = addVehicleToCart(vehicle, serviceMode);
      sync();
      return res;
    },
    [sync]
  );

  const remove = useCallback(
    (vehicleId: string) => {
      removeVehicleFromCart(vehicleId);
      sync();
    },
    [sync]
  );

  const clear = useCallback(() => {
    clearVehicleCart();
    sync();
  }, [sync]);

  const setItemServiceMode = useCallback(
    (vehicleId: string, serviceMode: PerVehicleServiceMode) => {
      setCartItemServiceMode(vehicleId, serviceMode);
      sync();
    },
    [sync]
  );

  const setAllWithDriver = useCallback(() => {
    setAllCartItemsServiceMode("WITH_DRIVER");
    sync();
  }, [sync]);

  const setAllSelfDrive = useCallback(() => {
    setAllCartItemsServiceMode("SELF_DRIVE");
    sync();
  }, [sync]);

  const getItem = useCallback((vehicleId: string) => getCartItem(vehicleId), [items]);

  const has = useCallback((vehicleId: string) => isVehicleInCart(vehicleId, items), [items]);

  return {
    items,
    city,
    count: items.length,
    dailyTotal: cartDailyTotal(items),
    modeCounts,
    toggle,
    add,
    remove,
    clear,
    has,
    getItem,
    setItemServiceMode,
    setAllWithDriver,
    setAllSelfDrive,
    sync
  };
};
