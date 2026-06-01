import { useState } from "react";
import {
  getVehicleImageUrl,
  resolveVehicleImageUrl,
  vehicleImageSeed,
  vehicleTypeLabel
} from "@rental-preview/shared";
import { cn } from "../lib/utils";

type VehicleImageProps = {
  src?: string;
  alt?: string;
  vehicleId?: string;
  vehicleTypeId?: string;
  className?: string;
};

export const VehicleImage = ({
  src,
  alt = "",
  vehicleId,
  vehicleTypeId,
  className
}: VehicleImageProps) => {
  const primary = resolveVehicleImageUrl(src, {
    vehicleId,
    vehicleTypeId,
    seed: vehicleId ? vehicleImageSeed(vehicleId) : 0
  });
  const [current, setCurrent] = useState(primary);

  const fallback = getVehicleImageUrl(
    vehicleId ? vehicleImageSeed(vehicleId, 1) : 1,
    vehicleTypeId
  );

  const label =
    alt ||
    (vehicleTypeId ? (vehicleTypeLabel[vehicleTypeId as keyof typeof vehicleTypeLabel] ?? vehicleTypeId) : "车辆");

  return (
    <img
      src={current}
      alt={label}
      className={cn("bg-muted object-cover", className)}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
};
