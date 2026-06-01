# 租车平台 · Preview 方案演示对齐说明

版本：1.0  
日期：2026-06-01

本文档说明交付包内 **`preview/` 方案演示工程** 与 **`docs/` 正式需求/设计文档** 的对齐关系。Preview 为纯前端 Mock，用于客户演示与需求确认，**不替代**正式后端实现。

---

## 1. 工程位置与启动

```bash
cd preview
npm install
npm run dev:admin   # 管理后台 http://localhost:5173
npm run dev:h5      # H5 http://localhost:5174
```

详见 [preview/README.md](../preview/README.md)。

---

## 2. 已对齐的正式文档（核心）

| 正式文档 | Preview 对齐要点 |
|---|---|
| [租车平台需求规格说明书.md](./租车平台需求规格说明书.md) | 用户/车辆/订单/支付/财务/企业模块演示路径 |
| [租车平台需求补充说明书（事故处理+用户认证细化）.md](./租车平台需求补充说明书（事故处理+用户认证细化）.md) | 驾照认证、实名、用车资格、事故 |
| [租车平台订单定价策略说明.md](./租车平台订单定价策略说明.md) | 定价规则、报价试算、包车司机费 |
| [租车平台订单开票方案对比（第三方vs自建）.md](./租车平台订单开票方案对比（第三方vs自建）.md) | 发票申请/开具状态（Mock） |
| [03-API/OpenAPI/openapi-gateway-rental-v1.yaml](./03-API/OpenAPI/openapi-gateway-rental-v1.yaml) | 请求响应字段形态 |
| [03-API/规范/api-error-codes-v1.md](./03-API/规范/api-error-codes-v1.md) | 3002~3005 自驾门禁 |

---

## 3. Preview 专篇文档（细节）

目录：`preview/docs/`

| 文档 | 内容 |
|---|---|
| [Preview功能与正式文档对照.md](../preview/docs/Preview功能与正式文档对照.md) | **总对照表**、演示脚本、OpenAPI 差异 |
| [驾照认证与用车资格.md](../preview/docs/驾照认证与用车资格.md) | FR-USER-013/014 |
| [服务方式与下单规则.md](../preview/docs/服务方式与下单规则.md) | 自驾 / 包车带司机 / 部分带司机+自驾 |
| [订单状态与财务延伸.md](../preview/docs/订单状态与财务延伸.md) | 发票/退款驱动订单状态 |
| [H5首页选车与下单.md](../preview/docs/H5首页选车与下单.md) | 多型号选车 |
| [车辆全生命周期轨迹.md](../preview/docs/车辆全生命周期轨迹.md) | 管理端车辆历史 |
| [司机管理.md](../preview/docs/司机管理.md) | 历史包车订单、违章归因、司机档案 |
| [自驾用车事故与违章规则.md](../preview/docs/自驾用车事故与违章规则.md) | **自驾** 事故+违章总览、演示脚本 |
| [用户驾车违章规则.md](../preview/docs/用户驾车违章规则.md) | 违章归因、我的违章 |

---

## 4. 管理后台模块映射

| 侧栏模块 | 正式需求 | Preview 要点 |
|---|---|---|
| 运营看板 | FR-OPS-003/004 | KPI + 异常预警文案 |
| 用户与认证 | FR-USER-012~014 | 驾照审核、自驾/包车规则说明 |
| 企业客户/用户/审批 | B/G 组织 | Orgs 三 Tab + 企业详情 |
| 车辆管理 | FR-VEH | 库存/轨迹/里程/违章/维保、车辆图上传 |
| 订单列表/详情 | FR-ORD | 财务状态、关联用户/车辆/司机 |
| 支付退款 / 电子发票 | FR-PAY / FR-FIN | 操作后同步订单状态 |
| 定价策略 | FR-OPS 定价 | 自驾/包车计费说明 |
| 司机与人员 | FR-OPS-008 | 司机 CRUD、档案（历史订单/违章） |
| 事故与违章 | FR-ORD-008~012 / FR-EXT | 自驾上报、归因、我的事故/违章 |

---

## 5. 维护约定

- Preview 新增能力时，同步更新 `preview/docs/Preview功能与正式文档对照.md` 与本节索引。  
- 正式 SRS 变更时，先改 `docs/`，再在 Preview 专篇中标注差异。  
- 技术栈说明仍以 [租车平台技术栈选型说明.md](./租车平台技术栈选型说明.md) 为准；Preview 前端栈与其 React 方向一致。
