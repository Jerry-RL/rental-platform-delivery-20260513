import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../common/auth.js";
import { paginate, parsePageQuery } from "../../common/pagination.js";
import { fail, ok } from "../../common/response.js";
import { enterpriseAccounts, orders, users, usersByPhone } from "../../common/store.js";
import type { EnterpriseAccountStatus, UserListItem, UserStatus } from "../../common/types.js";

const createIndividualSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(6),
  realName: z.string().min(2),
  licenseValid: z.boolean().default(true)
});

const createEnterpriseSchema = z.object({
  orgName: z.string().min(2),
  accountType: z.enum(["B", "G"]),
  contactName: z.string().min(2),
  contactPhone: z.string().min(6),
  creditLimit: z.number().nonnegative().default(100000)
});

const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"])
});

const updateEnterpriseStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"])
});

function countOrdersByUserId(userId: string) {
  return [...orders.values()].filter((order) => order.userId === userId).length;
}

function toUserListItem(user: { id: string; phone: string; realName: string; licenseValid: boolean; status: UserStatus; registeredAt: string }): UserListItem {
  return {
    id: user.id,
    phone: user.phone,
    realName: user.realName,
    licenseValid: user.licenseValid,
    status: user.status,
    registeredAt: user.registeredAt,
    orderCount: countOrdersByUserId(user.id)
  };
}

export const userListRouter = Router();

userListRouter.get("/", requireAuth, (req, res) => {
  const keyword = String(req.query.keyword || "").trim().toLowerCase();
  const status = String(req.query.status || "").trim() as UserStatus | "";
  const licenseValid = String(req.query.licenseValid || "").trim();
  const { page, pageSize } = parsePageQuery(req.query as Record<string, unknown>);

  let list = [...users.values()].map(toUserListItem);

  if (status.length > 0) {
    list = list.filter((user) => user.status === status);
  }

  if (licenseValid === "true") {
    list = list.filter((user) => user.licenseValid);
  } else if (licenseValid === "false") {
    list = list.filter((user) => !user.licenseValid);
  }

  if (keyword.length > 0) {
    list = list.filter(
      (user) =>
        user.phone.includes(keyword) ||
        user.realName.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword)
    );
  }

  list.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  ok(req, res, paginate(list, page, pageSize));
});

userListRouter.post("/", requireAuth, (req, res) => {
  const parsed = createIndividualSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  if (usersByPhone.has(parsed.data.phone)) {
    fail(req, res, "Phone already registered", 409);
    return;
  }

  const id = randomUUID();
  const user = {
    id,
    phone: parsed.data.phone,
    password: parsed.data.password,
    realName: parsed.data.realName,
    licenseValid: parsed.data.licenseValid,
    status: "ACTIVE" as const,
    registeredAt: new Date().toISOString()
  };
  users.set(id, user);
  usersByPhone.set(user.phone, id);

  ok(req, res, toUserListItem(user), "created", 201);
});

userListRouter.get("/enterprise", requireAuth, (req, res) => {
  const keyword = String(req.query.keyword || "").trim().toLowerCase();
  const status = String(req.query.status || "").trim() as EnterpriseAccountStatus | "";
  const accountType = String(req.query.accountType || "").trim();
  const { page, pageSize } = parsePageQuery(req.query as Record<string, unknown>);

  let list = [...enterpriseAccounts.values()];

  if (status.length > 0) {
    list = list.filter((account) => account.status === status);
  }

  if (accountType === "B" || accountType === "G") {
    list = list.filter((account) => account.accountType === accountType);
  }

  if (keyword.length > 0) {
    list = list.filter(
      (account) =>
        account.orgName.toLowerCase().includes(keyword) ||
        account.accountNo.toLowerCase().includes(keyword) ||
        account.contactName.toLowerCase().includes(keyword) ||
        account.contactPhone.includes(keyword)
    );
  }

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ok(req, res, paginate(list, page, pageSize));
});

userListRouter.post("/enterprise", requireAuth, (req, res) => {
  const parsed = createEnterpriseSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const id = randomUUID();
  const accountNo = `ORG-${parsed.data.accountType}-${String(enterpriseAccounts.size + 1).padStart(3, "0")}`;
  const account = {
    id,
    accountNo,
    orgName: parsed.data.orgName,
    accountType: parsed.data.accountType,
    contactName: parsed.data.contactName,
    contactPhone: parsed.data.contactPhone,
    creditLimit: parsed.data.creditLimit,
    status: "ACTIVE" as const,
    createdAt: new Date().toISOString()
  };
  enterpriseAccounts.set(id, account);
  ok(req, res, account, "created", 201);
});

userListRouter.put("/enterprise/:accountId/status", requireAuth, (req, res) => {
  const accountId = String(req.params.accountId);
  const existing = enterpriseAccounts.get(accountId);
  if (!existing) {
    fail(req, res, "Enterprise account not found", 404);
    return;
  }

  const parsed = updateEnterpriseStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  existing.status = parsed.data.status;
  enterpriseAccounts.set(accountId, existing);
  ok(req, res, existing);
});

userListRouter.put("/:userId/status", requireAuth, (req, res) => {
  const userId = String(req.params.userId);
  const existing = users.get(userId);
  if (!existing) {
    fail(req, res, "User not found", 404);
    return;
  }

  const parsed = updateUserStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  existing.status = parsed.data.status;
  users.set(userId, existing);
  ok(req, res, toUserListItem(existing));
});
