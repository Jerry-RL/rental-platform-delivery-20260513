import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { signToken } from "../../common/auth.js";
import { ok, fail } from "../../common/response.js";
import { userListRouter } from "./list-routes.js";
import { users, usersByPhone } from "../../common/store.js";

const registerSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(6),
  realName: z.string().min(2).default("未实名用户"),
  verifyCode: z.string().min(4).optional(),
  licenseValid: z.boolean().default(true)
});

const loginSchema = z.object({
  phone: z.string(),
  password: z.string()
});

export const userRouter = Router();

userRouter.use("/", userListRouter);

userRouter.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  if (usersByPhone.has(parsed.data.phone)) {
    fail(req, res, "Phone already registered", 409);
    return;
  }

  const id = randomUUID();
  users.set(id, {
    id,
    phone: parsed.data.phone,
    password: parsed.data.password,
    realName: parsed.data.realName,
    licenseValid: parsed.data.licenseValid,
    status: "ACTIVE",
    registeredAt: new Date().toISOString()
  });
  usersByPhone.set(parsed.data.phone, id);

  ok(
    req,
    res,
    {
      id,
      phone: parsed.data.phone,
      realName: parsed.data.realName,
      status: "ACTIVE"
    },
    "created",
    201
  );
});

userRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const userId = usersByPhone.get(parsed.data.phone);
  if (!userId) {
    fail(req, res, "Invalid credentials", 401);
    return;
  }

  const user = users.get(userId);
  if (!user || user.password !== parsed.data.password) {
    fail(req, res, "Invalid credentials", 401);
    return;
  }

  const accessToken = signToken({ userId: user.id, phone: user.phone });
  ok(req, res, {
    accessToken,
    refreshToken: "",
    expiresIn: 7 * 24 * 60 * 60
  });
});
