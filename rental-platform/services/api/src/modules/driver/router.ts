import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../common/auth.js";
import { enrichDriver, isLicenseValidForRental, normalizeDriver } from "../../common/driver-utils.js";
import { paginate, parsePageQuery } from "../../common/pagination.js";
import { fail, ok } from "../../common/response.js";
import { drivers } from "../../common/store.js";
import type { DriverStatus } from "../../common/types.js";

const createDriverSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  licenseNo: z.string().min(6),
  licenseType: z.string().min(1).default("C1"),
  city: z.string().min(2),
  status: z.enum(["AVAILABLE", "ON_DUTY", "OFF_DUTY", "SUSPENDED"]).default("AVAILABLE"),
  licenseImageUrl: z.string().optional(),
  licenseImages: z.array(z.string()).optional(),
  licenseExpiryDate: z.string().optional(),
  remindBeforeDays: z.number().int().min(1).max(180).default(30)
});

const updateDriverSchema = createDriverSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "ON_DUTY", "OFF_DUTY", "SUSPENDED"])
});

export const driverRouter = Router();

driverRouter.get("/", (req, res) => {
  const city = String(req.query.city || "").trim();
  const status = String(req.query.status || "").trim() as DriverStatus | "";
  const scope = String(req.query.scope || "all").trim();
  const reminder = String(req.query.reminder || "").trim();
  const keyword = String(req.query.keyword || "").trim().toLowerCase();
  const { page, pageSize } = parsePageQuery(req.query as Record<string, unknown>);

  let list = [...drivers.values()].map((d) => enrichDriver(d));

  if (scope === "rental") {
    list = list.filter((d) => d.status === "AVAILABLE" && isLicenseValidForRental(d.licenseReminder));
  }

  if (city.length > 0) {
    list = list.filter((d) => d.city.toLowerCase() === city.toLowerCase());
  }

  if (status.length > 0) {
    list = list.filter((d) => d.status === status);
  }

  if (keyword.length > 0) {
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(keyword) ||
        d.phone.includes(keyword) ||
        d.driverNo.toLowerCase().includes(keyword) ||
        d.licenseNo.toLowerCase().includes(keyword)
    );
  }

  if (reminder === "expiring") {
    list = list.filter((d) => d.licenseReminder === "EXPIRING_SOON" || d.licenseReminder === "EXPIRED");
  }

  list.sort((a, b) => a.driverNo.localeCompare(b.driverNo, "zh-CN"));
  ok(req, res, paginate(list, page, pageSize));
});

driverRouter.get("/:driverId", requireAuth, (req, res) => {
  const driver = drivers.get(String(req.params.driverId));
  if (!driver) {
    fail(req, res, "Driver not found", 404);
    return;
  }
  ok(req, res, enrichDriver(driver));
});

driverRouter.post("/", requireAuth, (req, res) => {
  const parsed = createDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const duplicate = [...drivers.values()].find((d) => d.phone === parsed.data.phone);
  if (duplicate) {
    fail(req, res, "Phone already used by another driver", 409);
    return;
  }

  const id = randomUUID();
  const driverNo = `D-${parsed.data.city.slice(0, 2).toUpperCase()}-${String(drivers.size + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const driver = normalizeDriver({
    id,
    driverNo,
    name: parsed.data.name,
    phone: parsed.data.phone,
    licenseNo: parsed.data.licenseNo,
    licenseType: parsed.data.licenseType,
    city: parsed.data.city,
    status: parsed.data.status,
    rating: 5,
    joinedAt: now,
    licenseImageUrl: parsed.data.licenseImageUrl ?? "",
    licenseImages: parsed.data.licenseImages ?? [],
    licenseExpiryDate: parsed.data.licenseExpiryDate ?? "",
    remindBeforeDays: parsed.data.remindBeforeDays,
    updatedAt: now
  });
  drivers.set(id, driver);
  ok(req, res, enrichDriver(driver), "created", 201);
});

driverRouter.put("/:driverId", requireAuth, (req, res) => {
  const driverId = String(req.params.driverId);
  const existing = drivers.get(driverId);
  if (!existing) {
    fail(req, res, "Driver not found", 404);
    return;
  }

  const parsed = updateDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const updated = normalizeDriver({
    ...existing,
    ...parsed.data,
    updatedAt: new Date().toISOString()
  });
  drivers.set(driverId, updated);
  ok(req, res, enrichDriver(updated));
});

driverRouter.put("/:driverId/status", requireAuth, (req, res) => {
  const driverId = String(req.params.driverId);
  const existing = drivers.get(driverId);
  if (!existing) {
    fail(req, res, "Driver not found", 404);
    return;
  }

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const updated = normalizeDriver({
    ...existing,
    status: parsed.data.status,
    updatedAt: new Date().toISOString()
  });
  drivers.set(driverId, updated);
  ok(req, res, enrichDriver(updated));
});
