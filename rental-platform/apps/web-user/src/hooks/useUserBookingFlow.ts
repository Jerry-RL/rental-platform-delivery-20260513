import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  confirmBill,
  createBill,
  createBillPayment,
  createOrder,
  getBillById,
  loginUser,
  registerUser,
  searchVehicles,
  sendBillPaymentCallback
} from "../services/userService";
import type { Bill, BillPayment, Order, Vehicle } from "../features/types";

type SetMessage = (message: string) => void;

export function useUserBookingFlow(setMessage: SetMessage) {
  const [phone, setPhone] = useState("13800000000");
  const [password, setPassword] = useState("123456");
  const [token, setToken] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [city, setCity] = useState("Shanghai");
  const [vehicleTypeId, setVehicleTypeId] = useState("SUV");
  const [settlementMode, setSettlementMode] = useState<"PREPAID" | "POSTPAID">("POSTPAID");
  const [serviceMode, setServiceMode] = useState<"SELF_DRIVE" | "WITH_DRIVER">("SELF_DRIVE");
  const [accountType, setAccountType] = useState<"C" | "B" | "G">("B");
  const [billingAccountId, setBillingAccountId] = useState("org-bg-001");
  const [driverId, setDriverId] = useState("driver-sh-001");
  const [order, setOrder] = useState<Order | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [billPayment, setBillPayment] = useState<BillPayment | null>(null);

  const authHeader = useMemo(
    () =>
      token.length > 0
        ? ({
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          } as HeadersInit)
        : ({ "Content-Type": "application/json" } as HeadersInit),
    [token]
  );

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    const result = await registerUser(phone, password);
    setMessage(result.ok ? "注册成功，请登录" : (result.error ?? "注册失败"));
  };

  const handleLogin = async () => {
    const result = await loginUser(phone, password);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "登录失败");
      return;
    }
    setToken(result.data.accessToken);
    setMessage("登录成功");
  };

  const handleSearchVehicles = async () => {
    const result = await searchVehicles(city, vehicleTypeId);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "查询车辆失败");
      return;
    }
    setVehicles(result.data);
    setMessage(`查询到 ${result.data.length} 台可租车辆`);
  };

  const handleCreateOrder = async (selectedVehicleTypeId: string) => {
    const payload = {
      vehicleTypeId: selectedVehicleTypeId,
      pickupStoreId: "store-sh-001",
      returnStoreId: "store-sh-001",
      pickupTime: new Date().toISOString(),
      returnTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      city,
      settlementMode,
      serviceMode,
      accountType,
      billingAccountId: settlementMode === "POSTPAID" ? billingAccountId : undefined,
      driverId: serviceMode === "WITH_DRIVER" ? driverId : undefined
    };
    const result = await createOrder(payload, authHeader);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "创建订单失败");
      return;
    }
    setOrder(result.data);
    setBill(null);
    setBillPayment(null);
    setMessage(`订单创建成功：${result.data.orderNo}`);
  };

  const handleCreateBill = async () => {
    if (!order?.billingAccountId || !order.billingPeriod) {
      setMessage("当前订单无账务主体或账期，无法生成账单");
      return;
    }
    const result = await createBill(
      {
        billingAccountId: order.billingAccountId,
        accountType: accountType === "C" ? "B" : accountType,
        billingPeriod: order.billingPeriod
      },
      authHeader
    );
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "生成账单失败");
      return;
    }
    setBill(result.data);
    setMessage(`账单生成成功：${result.data.billNo}`);
  };

  const handleConfirmBill = async () => {
    if (!bill) {
      setMessage("请先生成账单");
      return;
    }
    const result = await confirmBill(bill.id, authHeader);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "确认账单失败");
      return;
    }
    setBill(result.data);
    setMessage("账单确认成功");
  };

  const handleCreateBillPayment = async () => {
    if (!bill || !order?.billingAccountId) {
      setMessage("请先生成并确认账单");
      return;
    }
    const remainingAmount = Math.max(0, bill.totalAmount - bill.paidAmount);
    const result = await createBillPayment(
      {
        billId: bill.id,
        amount: remainingAmount,
        channel: "bank",
        billingAccountId: order.billingAccountId,
        billingPeriod: bill.billingPeriod,
        settlementMode: "POSTPAID"
      },
      authHeader
    );
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "创建支付单失败");
      return;
    }
    setBillPayment(result.data);
    setMessage(`对公支付单创建成功：${result.data.paymentNo}`);
  };

  const handleBillPaymentCallback = async (status: "SUCCESS" | "FAILED") => {
    if (!bill || !billPayment) {
      setMessage("请先创建对公支付单");
      return;
    }
    const callbackResult = await sendBillPaymentCallback({
      billId: bill.id,
      channelTxnNo: `bill_txn_${Date.now()}`,
      status,
      paidAmount: billPayment.amount,
      paidAt: new Date().toISOString(),
      idempotencyKey: `${billPayment.id}-${status}`,
      signature: "demo-signature"
    });
    if (!callbackResult.ok) {
      setMessage(callbackResult.error ?? "支付回调失败");
      return;
    }
    const refreshResult = await getBillById(bill.id, authHeader);
    if (refreshResult.ok && refreshResult.data) {
      setBill(refreshResult.data);
    }
    setMessage(`对公支付回调完成：${status}`);
  };

  return {
    phone,
    password,
    token,
    vehicles,
    city,
    vehicleTypeId,
    settlementMode,
    serviceMode,
    accountType,
    billingAccountId,
    driverId,
    order,
    bill,
    billPayment,
    authHeader,
    setPhone,
    setPassword,
    setCity,
    setVehicleTypeId,
    setSettlementMode,
    setServiceMode,
    setAccountType,
    setBillingAccountId,
    setDriverId,
    handleRegister,
    handleLogin,
    handleSearchVehicles,
    handleCreateOrder,
    handleCreateBill,
    handleConfirmBill,
    handleCreateBillPayment,
    handleBillPaymentCallback
  };
}
