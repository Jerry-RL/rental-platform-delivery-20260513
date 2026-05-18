import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { fail } from "./response.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export type AuthPayload = {
  userId: string;
  phone: string;
};

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    fail(req, res, "Unauthorized", 401);
    return;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as Request & { auth: AuthPayload }).auth = decoded;
    next();
  } catch {
    fail(req, res, "Invalid token", 401);
  }
}
