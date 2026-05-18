const api = require("../../services/api");
const { ensureLogin } = require("../../utils/auth");

Page({
  data: {
    orderId: "",
    paymentId: "",
    pollCount: 0,
    maxPollCount: 8,
    status: "UNKNOWN",
    resultJson: "{}"
  },

  onShow() {
    ensureLogin();
  },

  async onLoad(options) {
    const paymentId = (options && options.paymentId) || "";
    const orderId = (options && options.orderId) || "";
    if (!paymentId) {
      this.setData({ status: "INVALID_PARAM", resultJson: "{\"message\":\"缺少paymentId\"}" });
      return;
    }
    this.setData({ paymentId, orderId, status: "QUERYING", pollCount: 0 });
    await this.queryStatus();
    this.startPolling();
  },

  onUnload() {
    this.stopPolling();
  },

  startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(async () => {
      if (this.data.pollCount >= this.data.maxPollCount) {
        this.stopPolling();
        if (this.data.status === "QUERYING") {
          this.setData({ status: "TIMEOUT" });
        }
        return;
      }
      await this.queryStatus();
    }, 3000);
  },

  stopPolling() {
    if (!this.pollTimer) return;
    clearInterval(this.pollTimer);
    this.pollTimer = null;
  },

  isFinalStatus(status) {
    const finalStatuses = ["PAID", "SUCCESS", "FAILED", "CLOSED", "CANCELLED", "REFUND"];
    return finalStatuses.includes(status);
  },

  async queryStatus() {
    const paymentId = this.data.paymentId;
    this.setData({ status: "QUERYING", pollCount: this.data.pollCount + 1 });
    const result = await api.queryPaymentStatus(paymentId);
    if (!result.ok || !result.data) {
      this.setData({
        status: "QUERY_FAILED",
        resultJson: JSON.stringify({ message: result.error || "查询失败" }, null, 2)
      });
      return;
    }
    const status = result.data.status || "UNKNOWN";
    this.setData({
      status,
      resultJson: JSON.stringify(result.data, null, 2)
    });
    if (this.isFinalStatus(status)) {
      this.stopPolling();
    }
  },

  async handleRefreshStatus() {
    await this.queryStatus();
  },

  handleViewOrderStatus() {
    if (!this.data.orderId) return;
    wx.navigateTo({
      url: `/pkg-order/order-status/index?orderId=${encodeURIComponent(this.data.orderId)}`
    });
  },

  handleBackVehicles() {
    wx.switchTab({ url: "/pages/vehicles/index" });
  }
});
