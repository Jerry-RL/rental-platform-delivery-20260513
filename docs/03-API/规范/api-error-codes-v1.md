# 租车平台错误码字典（v1）

## 1. 规范

- 统一响应结构：`code`, `message`, `data`, `timestamp`, `requestId`
- 错误码分层：
  - 1xxx：通用请求错误
  - 2xxx：认证授权错误
  - 3xxx：用户域错误
  - 4xxx：车辆域错误
  - 5xxx：订单域错误
  - 6xxx：支付域错误
  - 7xxx：财务域错误
  - 9xxx：系统错误

## 2. 通用错误码

| code | message | 说明 |
|---|---|---|
| 1000 | INVALID_REQUEST | 请求格式错误 |
| 1001 | PARAM_REQUIRED | 缺少必要参数 |
| 1002 | PARAM_INVALID | 参数校验失败 |
| 1003 | RESOURCE_NOT_FOUND | 资源不存在 |
| 1004 | REQUEST_CONFLICT | 资源冲突 |
| 1005 | TOO_MANY_REQUESTS | 请求过于频繁 |

## 3. 认证与权限

| code | message | 说明 |
|---|---|---|
| 2001 | UNAUTHORIZED | 未登录或令牌无效 |
| 2002 | TOKEN_EXPIRED | 令牌过期 |
| 2003 | FORBIDDEN | 权限不足 |
| 2004 | MFA_REQUIRED | 需要二次认证 |

## 4. 领域错误码

### 4.1 用户域（3xxx）

| code | message | 说明 |
|---|---|---|
| 3001 | USER_NOT_FOUND | 用户不存在 |
| 3002 | USER_STATUS_INVALID | 用户状态不可用 |
| 3003 | LICENSE_EXPIRED | 驾照已过期 |
| 3004 | IDENTITY_NOT_VERIFIED | 未实名 |
| 3005 | DRIVER_NOT_VERIFIED | 实际驾驶人未通过认证 |
| 3006 | ORG_NOT_ACTIVE | 企业资质未激活 |
| 3007 | CREDIT_INSUFFICIENT | 授信额度不足 |
| 3008 | TAX_NO_INVALID | 税号校验失败 |

### 4.2 车辆域（4xxx）

| code | message | 说明 |
|---|---|---|
| 4001 | VEHICLE_NOT_FOUND | 车辆不存在 |
| 4002 | VEHICLE_NOT_AVAILABLE | 车辆不可用 |
| 4003 | VEHICLE_SLOT_CONFLICT | 车辆时间窗冲突 |
| 4004 | VEHICLE_STATUS_INVALID | 车辆状态非法 |
| 4005 | VEHICLE_ACCIDENT_HOLD | 车辆事故停运不可租 |

### 4.3 订单域（5xxx）

| code | message | 说明 |
|---|---|---|
| 5001 | ORDER_NOT_FOUND | 订单不存在 |
| 5002 | ORDER_STATUS_INVALID | 订单状态非法 |
| 5003 | ORDER_ALREADY_CANCELED | 订单已取消 |
| 5004 | ORDER_ALREADY_COMPLETED | 订单已完成 |
| 5005 | ORDER_CREATE_FAILED | 订单创建失败 |
| 5006 | ORDER_NOT_IN_USE | 订单非使用中，不可上报事故 |
| 5007 | INCIDENT_NOT_FOUND | 事故单不存在 |
| 5008 | INCIDENT_STATUS_INVALID | 事故状态非法 |
| 5009 | INCIDENT_PENDING_BLOCK | 存在未结案事故，禁止完成订单 |

### 4.4 支付域（6xxx）

| code | message | 说明 |
|---|---|---|
| 6001 | PAYMENT_NOT_FOUND | 支付单不存在 |
| 6002 | PAYMENT_CHANNEL_ERROR | 支付渠道异常 |
| 6003 | PAYMENT_IDEMPOTENT_HIT | 重复回调 |
| 6004 | PAYMENT_CONFIRM_FAILED | 支付确认失败 |
| 6005 | REFUND_FAILED | 退款失败 |

### 4.5 财务域（7xxx）

| code | message | 说明 |
|---|---|---|
| 7001 | INVOICE_NOT_FOUND | 发票不存在 |
| 7002 | INVOICE_APPLY_INVALID | 发票申请非法 |
| 7003 | BILL_NOT_SETTLED | 账单未结算 |
| 7004 | INVOICE_GENERATE_FAILED | 发票生成失败 |
| 7005 | PAYMENT_REF_ALREADY_EXISTS | 回款识别码已存在 |
| 7006 | BANK_LINE_NOT_FOUND | 银行流水不存在 |
| 7007 | BANK_LINE_ALREADY_MATCHED | 流水已匹配 |
| 7008 | BANK_MATCH_AMOUNT_INVALID | 匹配金额非法 |
| 7009 | INVOICE_ALREADY_ISSUED | 发票已开具 |
| 7010 | INVOICE_ISSUING | 发票开具中 |
| 7011 | INVOICE_PROVIDER_ERROR | 开票服务商返回错误 |
| 7012 | INVOICE_RED_FLUSH_INVALID | 红冲条件不满足 |

## 5. 系统错误

| code | message | 说明 |
|---|---|---|
| 9000 | INTERNAL_ERROR | 服务内部错误 |
| 9001 | DEPENDENCY_TIMEOUT | 依赖服务超时 |
| 9002 | DB_ERROR | 数据库异常 |
| 9003 | MQ_ERROR | 消息队列异常 |
