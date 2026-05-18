const api = require("../../services/api");
const { ensureLogin } = require("../../utils/auth");

const STATUS_LABELS = {
  PENDING_PAYMENT: "待支付",
  PAYMENT_FAILED: "支付失败",
  CONFIRMED: "已确认",
  READY_FOR_PICKUP: "待提车",
  IN_USE: "使用中",
  RETURN_PENDING_SETTLEMENT: "待结算",
  SETTLED: "已结算",
  COMPLETED: "已完成",
  CANCELED: "已取消"
};

Page({
  data: {
    orders: [],
    total: 0,
    page: 1,
    pageSize: 10,
    statusIndex: 0,
    statusOptions: ["全部状态", "待支付", "已确认", "使用中", "已完成", "已取消"],
    statusValues: ["", "PENDING_PAYMENT", "CONFIRMED", "IN_USE", "COMPLETED", "CANCELED"],
    selectedJson: "",
    message: "",
    loading: false
  },

  onShow() {
    if (!ensureLogin()) return;
    this.loadOrders();
  },

  loadOrders() {
    const status = this.data.statusValues[this.data.statusIndex];
    this.setData({ loading: true, message: "加载中…" });
    api
      .listMyOrders({ page: this.data.page, pageSize: this.data.pageSize, status })
      .then((result) => {
        if (!result.ok || !result.data) {
          this.setData({ loading: false, message: result.error || "加载失败", orders: [] });
          return;
        }
        const items = (result.data.items || []).map((order) =>
          Object.assign({}, order, {
            statusLabel: STATUS_LABELS[order.status] || order.status
          })
        );
        this.setData({
          loading: false,
          orders: items,
          total: result.data.total || items.length,
          message: `共 ${result.data.total || items.length} 条订单`
        });
      });
  },

  onStatusChange(e) {
    this.setData({ statusIndex: Number(e.detail.value), page: 1 }, () => this.loadOrders());
  },

  onRefresh() {
    this.setData({ page: 1 }, () => this.loadOrders());
  },

  onPrevPage() {
    if (this.data.page <= 1) return;
    this.setData({ page: this.data.page - 1 }, () => this.loadOrders());
  },

  onNextPage() {
    const maxPage = Math.max(1, Math.ceil(this.data.total / this.data.pageSize));
    if (this.data.page >= maxPage) return;
    this.setData({ page: this.data.page + 1 }, () => this.loadOrders());
  },

  onSelectOrder(e) {
    const order = e.currentTarget.dataset.order;
    this.setData({ selectedJson: JSON.stringify(order, null, 2) });
  },

  onGoPay(e) {
    const orderId = e.currentTarget.dataset.id;
    if (!orderId) return;
    wx.navigateTo({ url: `/pkg-order/payment/index?orderId=${orderId}` });
  }
});
