App({
  globalData: {
    token: wx.getStorageSync("token") || ""
  },

  onLaunch() {
    const token = wx.getStorageSync("token") || "";
    this.globalData.token = token;
  },

  setToken(token) {
    this.globalData.token = token || "";
    wx.setStorageSync("token", this.globalData.token);
  },

  clearToken() {
    this.globalData.token = "";
    wx.removeStorageSync("token");
  }
});
