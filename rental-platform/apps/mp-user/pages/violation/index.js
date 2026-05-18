const api = require("../../services/api");
const { ensureLogin } = require("../../utils/auth");

Page({
  data: {
    vehiclesText: "沪A12345\n沪B77889",
    taskJson: "{}",
    message: ""
  },

  onShow() {
    ensureLogin();
  },

  onVehiclesInput(event) {
    this.setData({ vehiclesText: event.detail.value });
  },

  async handleCreateTask() {
    const vehicleIds = this.data.vehiclesText
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!vehicleIds.length) {
      this.setData({ message: "请至少输入1个车牌或车辆ID" });
      return;
    }

    const result = await api.createViolationTask(vehicleIds);
    if (!result.ok) {
      this.setData({ message: result.error || "任务创建失败" });
      return;
    }

    this.setData({
      taskJson: JSON.stringify(result.data || {}, null, 2),
      message: result.isMock ? "任务创建成功（Mock模式）" : "任务创建成功（真实接口）"
    });
  }
});
