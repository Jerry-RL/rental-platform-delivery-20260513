function hasToken() {
  const app = getApp();
  const token = (app && app.globalData && app.globalData.token) || wx.getStorageSync("token");
  return Boolean(token);
}

function ensureLogin() {
  if (hasToken()) return true;
  wx.navigateTo({ url: "/pages/login/index" });
  return false;
}

module.exports = {
  hasToken,
  ensureLogin
};
