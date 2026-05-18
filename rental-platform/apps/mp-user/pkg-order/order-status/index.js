const api = require("../../services/api");
const { ensureLogin } = require("../../utils/auth");

Page({
  data: {
    orderId: "",
    status: "UNKNOWN",
    orderJson: "{}",
    message: ""
  },

  onShow() {
    ensureLogin();
  },

  async onLoad(options) {
    const orderId = (options && options.orderId) || "";
    if (!orderId) {
      this.setData({
        status: "INVALID_PARAM",
        orderJson: JSON.stringify({ message: "缺少orderId" }, null, 2)
      });
      return;
    }
    this.setData({ orderId });
    await this.loadOrder();
  },

  async loadOrder() {
    const result = await api.getOrderById(this.data.orderId);
    if (!result.ok || !result.data) {
      this.setData({
        status: "QUERY_FAILED",
        orderJson: JSON.stringify({ message: result.error || "查询订单失败" }, null, 2)
      });
      return;
    }
    this.setData({
      status: result.data.status || "UNKNOWN",
      orderJson: JSON.stringify(result.data, null, 2)
    });
  },

  async handleRefresh() {
    await this.loadOrder();
  },

  handleBackVehicles() {
    wx.switchTab({ url: "/pages/vehicles/index" });
  }
});
