import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  api,
  buildReorderBookingSearch,
  previewStore,
  type Order,
  type Vehicle
} from "@rental-preview/shared";

export const useReorder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const reorder = useCallback(async (order: Order) => {
    setLoading(true);
    const vehicleRes = await api.get<Vehicle>(`/api/v1/vehicles/${order.vehicleId}`);
    const vehicle = vehicleRes.ok && vehicleRes.data ? vehicleRes.data : null;
    const pickupStore = previewStore.stores.find((s) => s.id === order.pickupStoreId);
    const qs = buildReorderBookingSearch(order, vehicle, pickupStore ?? null);
    setLoading(false);
    navigate(`/booking?${qs}`);
  }, [navigate]);

  return { reorder, reordering: loading };
};
