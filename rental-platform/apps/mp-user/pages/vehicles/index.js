const api = require("../../services/api");
const { ensureLogin } = require("../../utils/auth");

Page({
  data: {
    city: "Shanghai",
    vehicleTypeId: "SUV",
    settlementModes: ["PREPAID", "POSTPAID"],
    serviceModes: ["SELF_DRIVE", "WITH_DRIVER"],
    settlementIndex: 1,
    serviceIndex: 0,
    vehicles: [],
    drivers: [],
    driverIndex: 0,
    latestOrderId: "",
    orderJson: "{}",
    message: ""
  },

  onShow() {
    ensureLogin();
  },

  onCityInput(event) {
    this.setData({ city: event.detail.value });
  },

  onVehicleTypeInput(event) {
    this.setData({ vehicleTypeId: event.detail.value });
  },

  onSettlementChange(event) {
    this.setData({ settlementIndex: Number(event.detail.value) });
  },

  onServiceChange(event) {
    const serviceIndex = Number(event.detail.value);
    this.setData({ serviceIndex }, () => {
      if (this.data.serviceModes[serviceIndex] === "WITH_DRIVER") {
        this.loadDrivers();
      }
    });
  },

  onDriverChange(event) {
    this.setData({ driverIndex: Number(event.detail.value) });
  },

  async loadDrivers() {
    const result = await api.listAvailableDrivers(this.data.city);
    const drivers = result.ok && result.data ? result.data : [];
    this.setData({ drivers, driverIndex: 0 });
  },

  async handleSearch() {
    const { city, vehicleTypeId } = this.data;
    const result = await api.searchVehicles(city, vehicleTypeId);
    if (!result.ok) {
      this.setData({ message: result.error || "查询失败" });
      return;
    }
    this.setData({
      vehicles: result.data || [],
      message: result.isMock ? "查询成功（Mock模式）" : "查询成功（真实接口）"
    });
    if (this.data.serviceModes[this.data.serviceIndex] === "WITH_DRIVER") {
      await this.loadDrivers();
    }
  },

  async handleCreateOrder(event) {
    const vehicleTypeId = event.currentTarget.dataset.vehicletypeid;
    const settlementMode = this.data.settlementModes[this.data.settlementIndex];
    const serviceMode = this.data.serviceModes[this.data.serviceIndex];
    if (serviceMode === "WITH_DRIVER" && !this.data.drivers.length) {
      this.setData({ message: "当前城市暂无可用司机" });
      return;
    }

    const payload = {
      vehicleTypeId,
      pickupStoreId: "store-sh-001",
      returnStoreId: "store-sh-001",
      pickupTime: new Date().toISOString(),
      returnTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      city: this.data.city,
      settlementMode,
      serviceMode,
      accountType: "B",
      billingAccountId: settlementMode === "POSTPAID" ? "org-bg-001" : undefined,
      driverId:
        serviceMode === "WITH_DRIVER" && this.data.drivers.length
          ? this.data.drivers[this.data.driverIndex].id
          : undefined
    };

    const result = await api.createOrder(payload);
    if (!result.ok) {
      this.setData({ message: result.error || "下单失败" });
      return;
    }
    this.setData({
      latestOrderId: (result.data && result.data.id) || "",
      orderJson: JSON.stringify(result.data || {}, null, 2),
      message: result.isMock ? "下单成功（Mock模式）" : "下单成功（真实接口）"
    });
  },

  handleGoPay() {
    const orderId = this.data.latestOrderId;
    if (!orderId) {
      this.setData({ message: "暂无可支付订单" });
      return;
    }
    wx.navigateTo({
      url: `/pkg-order/payment/index?orderId=${encodeURIComponent(orderId)}`
    });
  }
});
