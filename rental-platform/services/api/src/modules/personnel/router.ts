import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../common/auth.js";
import { paginate, parsePageQuery } from "../../common/pagination.js";
import { fail, ok } from "../../common/response.js";
import { personnel } from "../../common/store.js";
import type { PersonnelRole, PersonnelStatus } from "../../common/types.js";

const createPersonnelSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "OPERATOR", "FINANCE", "CUSTOMER_SERVICE"]),
  department: z.string().min(2),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")
});

const updatePersonnelSchema = createPersonnelSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"])
});

export const personnelRouter = Router();

personnelRouter.get("/", requireAuth, (req, res) => {
  const role = String(req.query.role || "").trim() as PersonnelRole | "";
  const status = String(req.query.status || "").trim() as PersonnelStatus | "";
  const department = String(req.query.department || "").trim();
  const keyword = String(req.query.keyword || "").trim().toLowerCase();
  const { page, pageSize } = parsePageQuery(req.query as Record<string, unknown>);

  let list = [...personnel.values()];

  if (role.length > 0) {
    list = list.filter((p) => p.role === role);
  }

  if (status.length > 0) {
    list = list.filter((p) => p.status === status);
  }

  if (department.length > 0) {
    list = list.filter((p) => p.department.toLowerCase().includes(department.toLowerCase()));
  }

  if (keyword.length > 0) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.phone.includes(keyword) ||
        p.employeeNo.toLowerCase().includes(keyword) ||
        (p.email?.toLowerCase().includes(keyword) ?? false)
    );
  }

  list.sort((a, b) => a.employeeNo.localeCompare(b.employeeNo, "zh-CN"));
  ok(req, res, paginate(list, page, pageSize));
});

personnelRouter.get("/:personnelId", requireAuth, (req, res) => {
  const member = personnel.get(String(req.params.personnelId));
  if (!member) {
    fail(req, res, "Personnel not found", 404);
    return;
  }
  ok(req, res, member);
});

personnelRouter.post("/", requireAuth, (req, res) => {
  const parsed = createPersonnelSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const duplicate = [...personnel.values()].find((p) => p.phone === parsed.data.phone);
  if (duplicate) {
    fail(req, res, "Phone already used", 409);
    return;
  }

  const id = randomUUID();
  const employeeNo = `EMP-${String(personnel.size + 1).padStart(3, "0")}`;
  const member = {
    id,
    employeeNo,
    ...parsed.data,
    hiredAt: new Date().toISOString()
  };
  personnel.set(id, member);
  ok(req, res, member, "created", 201);
});

personnelRouter.put("/:personnelId", requireAuth, (req, res) => {
  const personnelId = String(req.params.personnelId);
  const existing = personnel.get(personnelId);
  if (!existing) {
    fail(req, res, "Personnel not found", 404);
    return;
  }

  const parsed = updatePersonnelSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const updated = { ...existing, ...parsed.data };
  personnel.set(personnelId, updated);
  ok(req, res, updated);
});

personnelRouter.put("/:personnelId/status", requireAuth, (req, res) => {
  const personnelId = String(req.params.personnelId);
  const existing = personnel.get(personnelId);
  if (!existing) {
    fail(req, res, "Personnel not found", 404);
    return;
  }

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  existing.status = parsed.data.status;
  personnel.set(personnelId, existing);
  ok(req, res, existing);
});
