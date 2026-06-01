# Preview · B/G 端与 C 端区分及账号认证

## 登录与注册

| 端 | 注册 | 登录 |
|---|---|---|
| **C 端** | 须在 H5 `/register` 自助注册（`registrationSource=SELF`） | 仅已注册手机号可登录 |
| **B/G 端** | 由管理端企业成员开通（`ENTERPRISE`） | 企业分配手机号直接登录 |

接口：`POST /api/v1/users/register`、`POST /api/v1/users/login`（`user-auth.ts`）

## 识别规则

| 端 | 判定 | 租车门禁 |
|---|---|---|
| **C 端** | 用户无组织成员记录 | 须先注册登录 → 实名 + 自驾须驾照 |
| **B 端** | 存在 `orgMembers` 且企业 `accountType=B` | 企业 **ACTIVE** + 成员 **ACTIVE** + 实名 |
| **G 端** | 同上，`accountType=G` | 同 B 端 |

实现：`packages/shared/src/account-segment.ts` → `resolveAccountContext()`

## API

| 接口 | 说明 |
|---|---|
| `POST /api/v1/users/login` | 返回 `account`（segment、认证状态） |
| `GET /api/v1/users/me` | 当前用户 + `AccountContext` |
| `GET /api/v1/users/:id/eligibility` | 合并 B/G 认证与驾照资格 |
| `POST /api/v1/orders/quote`、`POST /api/v1/orders` | B/G 未认证返回 **3006** / **3002** |

## H5

- 顶栏展示 `segmentLabel`（如 B端企业 · 待认证）
- `AccountAuthBanner`：首页 / 下单 / 我的
- 未认证：禁止加入租车篮、去结算、提交订单

## 演示账号

| 手机号 | 身份 | 说明 |
|---|---|---|
| 13800138000 | C 端 | 个人，驾照已通过 |
| 13900139000 | B 端·已认证 | 华东物流，成员 ACTIVE |
| 13700137000 | G 端·已认证 | 机关事务局，成员 ACTIVE |
| 13600136000 | B 端·待认证 | 成员 PENDING，**不可租车** |

管理端可在「企业客户」审批成员开通（`MEMBER_OPEN`）。

## 正式文档

- `docs/租车平台需求规格说明书.md` — B/G 组织与成员
- `docs/03-API/规范/api-error-codes-v1.md` — 3006 ORG_NOT_ACTIVE
