const runtime = require("../config/runtime");

function getHeader(customHeader) {
  const app = getApp();
  const token = (app && app.globalData && app.globalData.token) || "";
  const authHeader = token ? { Authorization: "Bearer " + token } : {};
  return Object.assign({ "Content-Type": "application/json" }, authHeader, customHeader || {});
}

function normalizeUrl(path) {
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith("/") ? runtime.API_BASE_URL + path : runtime.API_BASE_URL + "/" + path;
}

function unwrapData(responseData) {
  if (responseData && typeof responseData === "object" && Object.prototype.hasOwnProperty.call(responseData, "data")) {
    return responseData.data;
  }
  return responseData;
}

function request(options) {
  const path = options.path;
  const method = options.method || "GET";
  const data = options.data || {};
  const header = getHeader(options.header);
  const mockData = options.mockData;

  if (runtime.USE_MOCK_MODE && mockData !== undefined) {
    return Promise.resolve({ ok: true, isMock: true, data: mockData, error: null });
  }

  return new Promise((resolve) => {
    wx.request({
      url: normalizeUrl(path),
      method,
      data,
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, isMock: false, data: unwrapData(res.data), error: null });
          return;
        }
        if (runtime.MOCK_FALLBACK && mockData !== undefined) {
          resolve({ ok: true, isMock: true, data: mockData, error: null });
          return;
        }
        const msg = (res.data && res.data.message) || "请求失败";
        resolve({ ok: false, isMock: false, data: null, error: msg });
      },
      fail() {
        if (runtime.MOCK_FALLBACK && mockData !== undefined) {
          resolve({ ok: true, isMock: true, data: mockData, error: null });
          return;
        }
        resolve({ ok: false, isMock: false, data: null, error: "网络异常，请稍后重试" });
      }
    });
  });
}

module.exports = {
  request
};
