const api = require("../../services/api");
const { hasToken } = require("../../utils/auth");

Page({
  data: {
    phone: "13800000000",
    password: "123456",
    message: ""
  },

  onShow() {
    if (!hasToken()) return;
    wx.switchTab({ url: "/pages/vehicles/index" });
  },

  onPhoneInput(event) {
    this.setData({ phone: event.detail.value });
  },

  onPasswordInput(event) {
    this.setData({ password: event.detail.value });
  },

  async handleLogin() {
    const { phone, password } = this.data;
    const result = await api.login(phone, password);
    if (!result.ok || !result.data) {
      this.setData({ message: result.error || "登录失败" });
      return;
    }

    const app = getApp();
    app.setToken(result.data.accessToken);
    this.setData({ message: result.isMock ? "登录成功（Mock模式）" : "登录成功（真实接口）" });
    wx.switchTab({ url: "/pages/vehicles/index" });
  }
});
