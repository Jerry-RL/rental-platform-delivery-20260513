const api = require("../../services/api");
const { ensureLogin } = require("../../utils/auth");

Page({
  data: {
    vehicleId: "vehicle-sh-001",
    realtimeJson: "{}",
    trackJson: "[]",
    message: ""
  },

  onShow() {
    ensureLogin();
  },

  onVehicleInput(event) {
    this.setData({ vehicleId: event.detail.value });
  },

  async handleRealtime() {
    const vehicleId = this.data.vehicleId.trim();
    if (!vehicleId) {
      this.setData({ message: "请输入车辆ID" });
      return;
    }
    const result = await api.getGpsRealtime(vehicleId);
    if (!result.ok) {
      this.setData({ message: result.error || "查询失败" });
      return;
    }
    this.setData({
      realtimeJson: JSON.stringify(result.data || {}, null, 2),
      message: result.isMock ? "实时位置读取成功（Mock模式）" : "实时位置读取成功（真实接口）"
    });
  },

  async handleTrack() {
    const vehicleId = this.data.vehicleId.trim();
    if (!vehicleId) {
      this.setData({ message: "请输入车辆ID" });
      return;
    }
    const result = await api.getGpsTrack(vehicleId);
    if (!result.ok) {
      this.setData({ message: result.error || "查询失败" });
      return;
    }
    this.setData({
      trackJson: JSON.stringify(result.data || [], null, 2),
      message: result.isMock ? "轨迹读取成功（Mock模式）" : "轨迹读取成功（真实接口）"
    });
  }
});
