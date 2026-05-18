import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../common/auth.js";
import { fail, ok } from "../../common/response.js";
import { bills, invoices, orders } from "../../common/store.js";
import type { Bill, Invoice } from "../../common/types.js";

const createInvoiceSchema = z.object({
  orderId: z.string().min(1),
  titleType: z.enum(["PERSONAL", "COMPANY"]),
  invoiceTitle: z.string().min(1),
  taxNo: z.string().optional(),
  email: z.string().email().optional(),
  billId: z.string().optional()
});

const createBillSchema = z.object({
  billingAccountId: z.string().min(1),
  accountType: z.enum(["B", "G"]),
  billingPeriod: z.string().min(1),
  dueDate: z.string().optional()
});

const confirmBillSchema = z.object({
  confirmedBy: z.string().min(1),
  confirmRemark: z.string().optional()
});

export const financeRouter = Router();

financeRouter.post("/bills", requireAuth, (req, res) => {
  const parsed = createBillSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const existed = [...bills.values()].find(
    (bill) =>
      bill.billingAccountId === parsed.data.billingAccountId &&
      bill.billingPeriod === parsed.data.billingPeriod
  );
  if (existed) {
    ok(req, res, existed);
    return;
  }

  const billOrders = [...orders.values()].filter(
    (order) =>
      order.billingAccountId === parsed.data.billingAccountId &&
      order.billingPeriod === parsed.data.billingPeriod &&
      ["SETTLED", "COMPLETED", "CONFIRMED", "IN_USE", "RETURN_PENDING_SETTLEMENT"].includes(order.status)
  );

  if (billOrders.length === 0) {
    fail(req, res, "No billable orders found for billing period", 409);
    return;
  }

  const totalAmount = billOrders.reduce((sum, order) => sum + order.totalFee, 0);
  const bill: Bill = {
    id: randomUUID(),
    billNo: `BILL${Date.now()}`,
    billingAccountId: parsed.data.billingAccountId,
    accountType: parsed.data.accountType,
    billingPeriod: parsed.data.billingPeriod,
    totalAmount,
    paidAmount: 0,
    status: "PENDING_CONFIRM",
    dueDate: parsed.data.dueDate,
    reconciliationStatus: "PENDING"
  };
  bills.set(bill.id, bill);
  ok(req, res, bill, "created", 201);
});

financeRouter.get("/bills/:billId", requireAuth, (req, res) => {
  const bill = bills.get(String(req.params.billId));
  if (!bill) {
    fail(req, res, "Bill not found", 404);
    return;
  }
  ok(req, res, bill);
});

financeRouter.put("/bills/:billId/confirm", requireAuth, (req, res) => {
  const parsed = confirmBillSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const bill = bills.get(String(req.params.billId));
  if (!bill) {
    fail(req, res, "Bill not found", 404);
    return;
  }
  if (bill.status !== "PENDING_CONFIRM") {
    fail(req, res, "Only pending confirm bill can be confirmed", 409);
    return;
  }

  bill.status = "PENDING_PAYMENT";
  bill.confirmedAt = new Date().toISOString();
  bill.confirmedBy = parsed.data.confirmedBy;
  bills.set(bill.id, bill);

  ok(req, res, bill);
});

financeRouter.post("/invoices", requireAuth, (req, res) => {
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const order = orders.get(parsed.data.orderId);
  if (!order) {
    fail(req, res, "Order not found", 404);
    return;
  }
  if (order.status !== "COMPLETED" && order.status !== "SETTLED") {
    fail(req, res, "Invoice requires settled/completed order", 409);
    return;
  }

  const invoice: Invoice = {
    id: randomUUID(),
    orderId: order.id,
    titleType: parsed.data.titleType,
    invoiceTitle: parsed.data.invoiceTitle,
    taxNo: parsed.data.taxNo,
    email: parsed.data.email,
    billId: parsed.data.billId,
    amount: order.totalFee,
    status: "CREATED"
  };
  invoices.set(invoice.id, invoice);

  ok(req, res, invoice, "created", 201);
});
