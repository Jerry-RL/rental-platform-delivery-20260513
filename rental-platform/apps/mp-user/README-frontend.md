# mp-user 小程序端说明

## 1. 功能范围

已实现的核心页面：

- `pages/login`：登录并写入 token
- `pages/vehicles`：车辆查询 + 下单
- `pages/violation`：批量违章任务创建
- `pages/gps`：实时定位 + 历史轨迹
- `pages/reminder`：到期提醒摘要 + 地图选点
- `pkg-order/payment`：订单支付页
- `pkg-order/payment-result`：支付结果回跳页
- `pkg-order/order-status`：订单状态页
- 支付失败后支持：重试预支付 + 取消订单
- 支付结果页支持自动轮询（3秒/次，最多8次）
- 所有核心业务页已接入登录态守卫（未登录自动引导登录）

## 2. 目录结构

- `app.js / app.json / app.wxss`：小程序全局配置
- `config/runtime.js`：API 与 mock 开关
- `config/runtime.example.js`：生产配置样例
- `utils/request.js`：统一请求封装（支持 mock fallback）
- `utils/auth.js`：登录态检测与守卫
- `services/api.js`：业务 API
- `pages/*`：页面实现
- `project.config.json`：微信开发者工具项目配置

## 3. 配置项

编辑 `config/runtime.js`：

- `API_BASE_URL`：后端地址
- `USE_MOCK_MODE`：是否强制 mock
- `MOCK_FALLBACK`：真实请求失败是否回退 mock
- `MINI_PROGRAM_APPID`：小程序 appid（占位）
- `MAP_KEY`：地图 key（占位）
- `ENABLE_PAYMENT`：是否启用 `wx.requestPayment`

## 4. 运行方式

1. 使用微信开发者工具打开 `apps/mp-user`
2. 确认 `project.config.json` 中 `appid`
3. 在工具中编译并预览

## 5. 发布前检查

1. 将 `project.config.json` 的 `appid` 改为正式 appid
2. 按 `config/runtime.example.js` 覆盖 `runtime.js`
3. 后端开放并联通：
   - `POST /payments/wechat/prepay`
   - `GET /payments/{paymentId}`
   - `PUT /orders/{orderId}/cancel`
   - `GET /orders/{orderId}`
4. 在微信公众平台完成：
   - 定位权限说明（`scope.userLocation`）
   - 支付商户配置
5. `USE_MOCK_MODE` 设为 `false`，`MOCK_FALLBACK` 设为 `false`

## 6. 联调建议

- 后端联调：`USE_MOCK_MODE = false`
- 演示阶段：`USE_MOCK_MODE = true`
- 半联调：`USE_MOCK_MODE = false` + `MOCK_FALLBACK = true`

## 7. 接口字段兼容说明

小程序端已对关键返回字段做兼容归一：

- 登录：`accessToken / token / jwtToken`
- 订单：`id / orderId / orderNo`
- 预支付：`timeStamp / timestamp`、`package / packageValue / prepayId`
- 支付状态：`status / tradeState / payStatus`
- 支付页取消原因：`PRICE_CHANGED / SCHEDULE_CHANGED / DUPLICATE_ORDER / OTHER`
