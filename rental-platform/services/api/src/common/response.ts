import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

export function requestIdFrom(req: Request): string {
  return (req.headers["x-request-id"] as string) || randomUUID();
}

export function ok<T>(
  req: Request,
  res: Response,
  data: T,
  message = "success",
  statusCode = 200
): void {
  res.status(statusCode).json({
    code: 0,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: requestIdFrom(req)
  });
}

export function fail(
  req: Request,
  res: Response,
  message: string,
  statusCode = 400
): void {
  res.status(statusCode).json({
    code: statusCode,
    message,
    data: null,
    timestamp: new Date().toISOString(),
    requestId: requestIdFrom(req)
  });
}
