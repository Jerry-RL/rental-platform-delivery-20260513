import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../common/auth.js";
import { fail, ok } from "../../common/response.js";
import {
  billPayments,
  bills,
  financeTickets,
  orders,
  payments,
  processedCallbacks
} from "../../common/store.js";
import type { BillPayment, Payment } from "../../common/types.js";

const createPaymentSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  channel: z.enum(["alipay", "wechat", "bank"]),
  settlementMode: z.enum(["PREPAID", "POSTPAID"]),
  billingAccountId: z.string().optional(),
  billingPeriod: z.string().optional()
});

const callbackSchema = z.object({
  orderId: z.string().min(1),
  channelTxnNo: z.string().min(1),
  status: z.enum(["SUCCESS", "FAILED"]),
  paidAt: z.string().datetime().optional(),
  signature: z.string().min(8).optional()
});

const refundSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  reason: z.string().optional()
});

const createBillPaymentSchema = z.object({
  billId: z.string().min(1),
  amount: z.number().positive(),
  channel: z.enum(["bank", "transfer", "offline"]),
  billingAccountId: z.string().min(1),
  billingPeriod: z.string().min(1),
  settlementMode: z.literal("POSTPAID").optional()
});

const billCallbackSchema = z.object({
  billId: z.string().min(1),
  channelTxnNo: z.string().min(1),
  status: z.enum(["SUCCESS", "FAILED"]),
  paidAmount: z.number().positive(),
  paidAt: z.string().datetime().optional(),
  idempotencyKey: z.string().min(1).optional(),
  signature: z.string().min(8).optional()
});

export const paymentRouter = Router();
export const refundRouter = Router();

paymentRouter.post("/", requireAuth, (req, res) => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const order = orders.get(parsed.data.orderId);
  if (!order) {
    fail(req, res, "Order not found", 404);
    return;
  }

  if (parsed.data.settlementMode !== order.settlementMode) {
    fail(req, res, "settlementMode does not match order", 409);
    return;
  }

  if (parsed.data.amount !== order.totalFee) {
    fail(req, res, "payment amount must equal order totalFee", 409);
    return;
  }

  const payment: Payment = {
    id: randomUUID(),
    orderId: parsed.data.orderId,
    channel: parsed.data.channel,
    channelTxnNo: `txn_${Date.now()}`,
    amount: parsed.data.amount,
    idempotencyKey: `${parsed.data.orderId}-${Date.now()}`,
    status: "PENDING"
  };
  payments.set(payment.id, payment);

  ok(req, res, payment, "created", 201);
});

paymentRouter.post("/callback", (req, res) => {
  const parsed = callbackSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  if (!parsed.data.signature) {
    fail(req, res, "Missing callback signature", 401);
    return;
  }

  if (processedCallbacks.has(parsed.data.channelTxnNo)) {
    ok(req, res, { idempotent: true });
    return;
  }

  const matchedPayment = [...payments.values()].find(
    (payment) =>
      payment.channelTxnNo === parsed.data.channelTxnNo || payment.orderId === parsed.data.orderId
  );
  if (!matchedPayment) {
    fail(req, res, "Payment not found", 404);
    return;
  }

  matchedPayment.channelTxnNo = parsed.data.channelTxnNo;
  matchedPayment.status = parsed.data.status === "SUCCESS" ? "SUCCESS" : "FAILED";
  payments.set(matchedPayment.id, matchedPayment);
  processedCallbacks.add(parsed.data.channelTxnNo);

  const order = orders.get(parsed.data.orderId);
  if (order) {
    if (parsed.data.status === "SUCCESS") {
      order.status = "CONFIRMED";
      order.paidAmount += matchedPayment.amount;
    } else {
      order.status = "PAYMENT_FAILED";
    }
    orders.set(order.id, order);
  }

  ok(req, res, { idempotent: false });
});

paymentRouter.post("/bills", requireAuth, (req, res) => {
  const parsed = createBillPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const bill = bills.get(parsed.data.billId);
  if (!bill) {
    fail(req, res, "Bill not found", 404);
    return;
  }

  if (!["PENDING_PAYMENT", "PARTIALLY_PAID"].includes(bill.status)) {
    fail(req, res, "Bill is not payable", 409);
    return;
  }

  if (bill.billingAccountId !== parsed.data.billingAccountId || bill.billingPeriod !== parsed.data.billingPeriod) {
    fail(req, res, "Bill account or period mismatch", 409);
    return;
  }

  const remaining = Math.max(0, bill.totalAmount - bill.paidAmount);
  if (parsed.data.amount > remaining) {
    fail(req, res, "Payment amount exceeds remaining bill amount", 409);
    return;
  }

  const billPayment: BillPayment = {
    id: randomUUID(),
    billId: bill.id,
    paymentNo: `BP${Date.now()}`,
    channel: parsed.data.channel,
    amount: parsed.data.amount,
    status: "PENDING",
    idempotencyKey: `${bill.id}-${Date.now()}`,
    retryCount: 0
  };
  billPayments.set(billPayment.id, billPayment);

  ok(req, res, billPayment, "created", 201);
});

function scheduleBillPaymentRetry(payment: BillPayment): void {
  const intervalsInMinutes = [5, 15, 30];
  if (payment.retryCount >= intervalsInMinutes.length) {
    payment.deadLetterReason = "PAYMENT_RETRY_EXCEEDED";
    payment.nextRetryAt = undefined;
    billPayments.set(payment.id, payment);
    financeTickets.push({
      id: randomUUID(),
      billId: payment.billId,
      reason: "PAYMENT_RETRY_EXCEEDED",
      createdAt: new Date().toISOString()
    });
    const bill = bills.get(payment.billId);
    if (bill && bill.status !== "PAID") {
      bill.status = "OVERDUE";
      bills.set(bill.id, bill);
    }
    return;
  }

  const delayMinutes = intervalsInMinutes[payment.retryCount];
  const next = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
  payment.nextRetryAt = next;
  billPayments.set(payment.id, payment);
}

paymentRouter.post("/bills/callback", (req, res) => {
  const parsed = billCallbackSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  if (!parsed.data.signature) {
    fail(req, res, "Missing callback signature", 401);
    return;
  }

  const callbackKey = parsed.data.idempotencyKey ?? parsed.data.channelTxnNo;
  if (processedCallbacks.has(callbackKey)) {
    ok(req, res, { idempotent: true });
    return;
  }

  const bill = bills.get(parsed.data.billId);
  if (!bill) {
    fail(req, res, "Bill not found", 404);
    return;
  }

  const pendingBillPayment = [...billPayments.values()].find(
    (payment) => payment.billId === parsed.data.billId && payment.status === "PENDING"
  );
  if (!pendingBillPayment) {
    fail(req, res, "No pending bill payment found", 404);
    return;
  }

  pendingBillPayment.channelTxnNo = parsed.data.channelTxnNo;
  pendingBillPayment.paidAt = parsed.data.paidAt ?? new Date().toISOString();

  if (parsed.data.status === "SUCCESS") {
    pendingBillPayment.status = "SUCCESS";
    bill.paidAmount = Math.min(bill.totalAmount, bill.paidAmount + parsed.data.paidAmount);
    bill.lastPaymentAt = pendingBillPayment.paidAt;
    if (bill.paidAmount >= bill.totalAmount) {
      bill.status = "PAID";
      bill.settledAt = new Date().toISOString();
      bill.reconciliationStatus = "DONE";
      for (const order of orders.values()) {
        if (order.billingAccountId === bill.billingAccountId && order.billingPeriod === bill.billingPeriod) {
          order.paidAmount = order.totalFee;
          if (order.status === "SETTLED") {
            order.status = "COMPLETED";
          }
          orders.set(order.id, order);
        }
      }
    } else {
      bill.status = "PARTIALLY_PAID";
    }
  } else {
    pendingBillPayment.status = "FAILED";
    bill.status = "PAYMENT_FAILED";
    pendingBillPayment.retryCount += 1;
    scheduleBillPaymentRetry(pendingBillPayment);
  }

  bills.set(bill.id, bill);
  billPayments.set(pendingBillPayment.id, pendingBillPayment);
  processedCallbacks.add(callbackKey);

  ok(req, res, { idempotent: false, billStatus: bill.status });
});

refundRouter.post("/", requireAuth, (req, res) => {
  const parsed = refundSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(req, res, parsed.error.message, 422);
    return;
  }

  const order = orders.get(parsed.data.orderId);
  if (!order) {
    fail(req, res, "Order not found", 404);
    return;
  }

  order.paidAmount = Math.max(0, order.paidAmount - parsed.data.amount);
  orders.set(order.id, order);

  ok(req, res, {
    refundId: randomUUID(),
    orderId: order.id,
    amount: parsed.data.amount,
    status: "SUCCESS"
  });
});
