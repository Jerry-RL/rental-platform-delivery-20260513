import { useState } from "react";
import { createInvoice, getOrderById, loginAdmin, pickupOrder, returnOrder, sendPaymentCallback } from "../services/adminService";

type SetMessage = (message: string) => void;

export function useAdminCoreFlow(setMessage: SetMessage) {
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState("13800000000");
  const [password, setPassword] = useState("123456");
  const [orderId, setOrderId] = useState("");
  const [billId, setBillId] = useState("");
  const [txnNo, setTxnNo] = useState(`txn_${Date.now()}`);
  const [orderJson, setOrderJson] = useState("{}");

  const headers: HeadersInit = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };

  const handleLogin = async (): Promise<boolean> => {
    const result = await loginAdmin(phone, password);
    if (!result.ok || !result.data) {
      setMessage(result.error ?? "登录失败");
      return false;
    }
    setToken(result.data.accessToken);
    setMessage("管理员调试登录成功");
    return true;
  };

  const handleLogout = () => {
    setToken("");
    setOrderJson("{}");
    setMessage("已退出登录");
  };

  const handleQueryOrder = async () => {
    const result = await getOrderById(orderId, headers);
    if (!result.ok) {
      setMessage(result.error ?? "查询订单失败");
      return;
    }
    setOrderJson(JSON.stringify(result.data ?? {}, null, 2));
  };

  const handlePaymentCallback = async (status: "SUCCESS" | "FAILED") => {
    const result = await sendPaymentCallback(
      billId
        ? {
            billId,
            channelTxnNo: txnNo,
            status,
            paidAmount: 100,
            paidAt: new Date().toISOString(),
            idempotencyKey: `${billId}-${txnNo}-${status}`,
            signature: "demo-signature"
          }
        : { orderId, channelTxnNo: txnNo, status, paidAt: new Date().toISOString(), signature: "demo-signature" }
    );
    setMessage(result.ok ? `回调处理完成: ${status}` : (result.error ?? "回调处理失败"));
  };

  const handlePickup = async () => {
    const result = await pickupOrder(orderId, headers);
    setMessage(result.ok ? "提车成功" : (result.error ?? "提车失败"));
  };

  const handleReturn = async () => {
    const result = await returnOrder(orderId, headers);
    setMessage(result.ok ? "还车与结算成功" : (result.error ?? "还车失败"));
  };

  const handleCreateInvoice = async () => {
    const result = await createInvoice(orderId, headers);
    setMessage(result.ok && result.data ? `发票创建成功: ${result.data.id}` : (result.error ?? "发票创建失败"));
  };

  return {
    token,
    phone,
    password,
    orderId,
    billId,
    txnNo,
    orderJson,
    headers,
    setPhone,
    setPassword,
    setOrderId,
    setBillId,
    setTxnNo,
    handleLogin,
    handleLogout,
    handleQueryOrder,
    handlePaymentCallback,
    handlePickup,
    handleReturn,
    handleCreateInvoice
  };
}
