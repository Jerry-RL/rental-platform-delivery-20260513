export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
};

export type User = {
  id: string;
  phone: string;
  password: string;
  realName: string;
  licenseValid: boolean;
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleTypeId: string;
  city: string;
  dailyPrice: number;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE";
};

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "IN_USE"
  | "RETURN_PENDING_SETTLEMENT"
  | "SETTLED"
  | "COMPLETED"
  | "CANCELED";

export type SettlementMode = "PREPAID" | "POSTPAID";
export type ServiceMode = "SELF_DRIVE" | "WITH_DRIVER";

export type Order = {
  id: string;
  orderNo: string;
  userId: string;
  vehicleId: string;
  pickupStoreId: string;
  returnStoreId: string;
  pickupTime: string;
  returnTime: string;
  status: OrderStatus;
  settlementMode: SettlementMode;
  serviceMode: ServiceMode;
  billingAccountId?: string;
  billingPeriod?: string;
  accountType?: "C" | "B" | "G";
  driverId?: string;
  chauffeurFee: number;
  estimatedFee: number;
  totalFee: number;
  paidAmount: number;
};

export type Payment = {
  id: string;
  orderId: string;
  channel: "alipay" | "wechat" | "bank";
  channelTxnNo: string;
  idempotencyKey?: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
};

export type BillStatus =
  | "PENDING_CONFIRM"
  | "PENDING_PAYMENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "PAYMENT_FAILED"
  | "OVERDUE";

export type Bill = {
  id: string;
  billNo: string;
  billingAccountId: string;
  accountType: "B" | "G";
  billingPeriod: string;
  totalAmount: number;
  paidAmount: number;
  status: BillStatus;
  dueDate?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  lastPaymentAt?: string;
  settledAt?: string;
  reconciliationStatus: "PENDING" | "DONE" | "FAILED";
};

export type BillPayment = {
  id: string;
  billId: string;
  paymentNo: string;
  channel: "bank" | "transfer" | "offline";
  channelTxnNo?: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  idempotencyKey: string;
  retryCount: number;
  nextRetryAt?: string;
  deadLetterReason?: string;
  paidAt?: string;
};

export type Invoice = {
  id: string;
  orderId: string;
  billId?: string;
  titleType: "PERSONAL" | "COMPANY";
  invoiceTitle: string;
  taxNo?: string;
  email?: string;
  amount: number;
  status: "CREATED";
};
