const api = require("../../services/api");
const runtime = require("../../config/runtime");
const { ensureLogin } = require("../../utils/auth");

Page({
  data: {
    orderId: "",
    paymentId: "",
    amount: 0,
    cancelReasonCodes: ["PRICE_CHANGED", "SCHEDULE_CHANGED", "DUPLICATE_ORDER", "OTHER"],
    cancelReasonLabels: ["价格变化", "行程变化", "重复下单", "其他"],
    cancelReasonIndex: 0,
    paying: false,
    prepayLoading: false,
    cancelLoading: false,
    paymentPayload: null,
    message: ""
  },

  onShow() {
    ensureLogin();
  },

  async onLoad(options) {
    const orderId = (options && options.orderId) || "";
    if (!orderId) {
      this.setData({ message: "缺少订单ID" });
      return;
    }
    this.setData({ orderId });
    await this.loadPrepay("正在创建支付单...");
  },

  async loadPrepay(loadingText) {
    const orderId = this.data.orderId;
    this.setData({ prepayLoading: true, message: loadingText || "正在加载支付参数..." });
    const result = await api.createPayment(orderId);
    if (!result.ok || !result.data) {
      this.setData({ prepayLoading: false, message: result.error || "创建支付单失败" });
      return;
    }
    this.setData({
      prepayLoading: false,
      paymentId: result.data.paymentId,
      amount: result.data.amount || 0,
      paymentPayload: result.data,
      message: result.isMock ? "支付单创建成功（Mock模式）" : "支付单创建成功（真实接口）"
    });
  },

  async handleRetryPrepay() {
    await this.loadPrepay("正在重试创建支付单...");
  },

  onCancelReasonChange(event) {
    this.setData({ cancelReasonIndex: Number(event.detail.value) });
  },

  handlePay() {
    if (!runtime.ENABLE_PAYMENT) {
      this.setData({ message: "当前环境未开启支付" });
      return;
    }
    if (!this.data.paymentPayload) {
      this.setData({ message: "支付参数为空" });
      return;
    }

    const payload = this.data.paymentPayload;
    this.setData({ paying: true, message: "支付中..." });
    wx.requestPayment({
      timeStamp: payload.timeStamp,
      nonceStr: payload.nonceStr,
      package: payload.package,
      signType: payload.signType || "RSA",
      paySign: payload.paySign,
      success: () => {
        wx.redirectTo({
          url: `/pkg-order/payment-result/index?paymentId=${encodeURIComponent(payload.paymentId)}&orderId=${encodeURIComponent(
            this.data.orderId
          )}`
        });
      },
      fail: () => {
        this.setData({ paying: false, message: "支付取消或失败，可重试支付或取消订单" });
      }
    });
  },

  async handleCancelOrder() {
    const orderId = this.data.orderId;
    if (!orderId) {
      this.setData({ message: "缺少订单ID，无法取消" });
      return;
    }

    this.setData({ cancelLoading: true, message: "正在取消订单..." });
    const reasonCode = this.data.cancelReasonCodes[this.data.cancelReasonIndex] || "OTHER";
    const result = await api.cancelOrder(orderId, reasonCode);
    if (!result.ok) {
      this.setData({ cancelLoading: false, message: result.error || "取消订单失败" });
      return;
    }

    this.setData({ cancelLoading: false, message: "订单已取消" });
    wx.switchTab({ url: "/pages/vehicles/index" });
  }
});
