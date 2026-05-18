import { Router } from "express";
import { ok } from "../../common/response.js";
import { vehicles } from "../../common/store.js";

export const vehicleRouter = Router();

vehicleRouter.get("/", (req, res) => {
  const city = String(req.query.city || "").trim();
  const vehicleTypeId = String(req.query.vehicleTypeId || "").trim();

  let list = [...vehicles.values()].filter((v) => v.status === "AVAILABLE");

  if (city.length > 0) {
    list = list.filter((v) => v.city.toLowerCase() === city.toLowerCase());
  }

  if (vehicleTypeId.length > 0) {
    list = list.filter((v) => v.vehicleTypeId === vehicleTypeId);
  }

  ok(req, res, list);
});
