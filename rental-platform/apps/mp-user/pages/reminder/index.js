const api = require("../../services/api");
const runtime = require("../../config/runtime");
const { ensureLogin } = require("../../utils/auth");

Page({
  data: {
    summaryJson: "{}",
    locationJson: "{}",
    mapKey: runtime.MAP_KEY,
    message: ""
  },

  onShow() {
    ensureLogin();
  },

  async handleLoadSummary() {
    const result = await api.getReminderSummary();
    if (!result.ok) {
      this.setData({ message: result.error || "读取失败" });
      return;
    }
    this.setData({
      summaryJson: JSON.stringify(result.data || {}, null, 2),
      message: result.isMock ? "提醒摘要读取成功（Mock模式）" : "提醒摘要读取成功（真实接口）"
    });
  },

  handleChooseLocation() {
    wx.getSetting({
      success: (settingRes) => {
        const locationAuth = settingRes.authSetting && settingRes.authSetting["scope.userLocation"];
        if (locationAuth === false) {
          this.setData({ message: "请在设置里开启定位权限后重试" });
          wx.openSetting();
          return;
        }
        wx.chooseLocation({
          success: (res) => {
            const payload = {
              name: res.name,
              address: res.address,
              latitude: res.latitude,
              longitude: res.longitude
            };
            this.setData({
              locationJson: JSON.stringify(payload, null, 2),
              message: "位置选择成功"
            });
          },
          fail: () => {
            this.setData({ message: "位置选择失败，请检查定位权限或地图能力配置" });
          }
        });
      },
      fail: () => {
        this.setData({ message: "读取系统权限失败" });
      }
    });
  }
});
