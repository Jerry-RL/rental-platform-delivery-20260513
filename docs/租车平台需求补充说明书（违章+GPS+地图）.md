# 租车平台需求补充说明书（违章+GPS+地图）

版本：v1.1  
日期：2026-06-01  
适用范围：在现有《租车平台需求规格说明书》基础上新增扩展能力

## 1. 背景与目标

为提升项目价值与运营效率，本次需求补充聚焦以下四个方向：

- 批量违章查询（可计费、可控成本）
- 车辆 GPS 实时定位与轨迹查询
- 保险/年审到期提醒
- 地图能力与商用授权风险控制

目标是实现“可上线、可计费、可审计、可控风险”的扩展模块。

## 2. 范围定义

### 2.1 In Scope

- 小程序端：起点位置输入、定位选点、车辆定位展示
- 管理端：批量违章查询任务、查询配额配置、费用统计、到期提醒配置
- 后端：[数脉科技违章 API](https://www.shumaiapi.com/productDetail/25)（¥0.06/次，600元/1万次）对接、GPS 厂商 API 对接、任务调度、重试与审计

### 2.2 Out of Scope

- 复杂地图渲染引擎自研
- 多供应商智能路由（一期不做自动择优）
- 违章争议申诉流程（仅保留查询与记录）

## 3. 角色与使用场景

- 运营管理员：发起批量违章查询、查看月度成本
- 车队管理员：查看车辆实时位置与轨迹
- 财务管理员：核对第三方调用费用与内部配额消耗
- 系统管理员：配置地图模式、接口密钥与告警规则

## 4. 功能需求（补充）

### 4.1 批量违章查询

- 供应商：**数脉科技** — 全国车辆违章详情查询（[产品页](https://www.shumaiapi.com/productDetail/25)）
- 计费：**¥0.06/次**（按成功查询的车辆计次）；建议采购 **¥600/1万次** 套餐
- 单车查询入参：车牌号、发动机号、车架号（VIN）、车辆类型（车辆主数据须维护）
- 支持按车辆列表批量提交查询任务
- 支持任务状态：`PENDING`、`RUNNING`、`PARTIAL_SUCCESS`、`SUCCESS`、`FAILED`
- 支持结果回填与失败明细（按车辆维度）：地点、行为、罚款、记分、城市等
- 支持按月配额控制（默认每月2次，可配置）
- 支持成本统计（`unit_cost` 默认 0.06、任务总成本、月累计）
- 企业接入前须完成数脉侧 **应用场景审核**

### 4.2 GPS定位与轨迹

- 支持车辆实时定位查询（经纬度、速度、时间戳）
- 支持历史轨迹回放（按车辆+时间段）
- 支持在线状态展示（在线/离线/未知）
- 支持接口超时重试与熔断降级

### 4.3 到期提醒

- 支持保险到期提醒
- 支持年审到期提醒
- 支持提前提醒天数配置（如30/15/7天）
- 支持提醒发送记录与去重

### 4.4 地图与合规控制

- 支持两种地图接入策略：
  - 地图厂商直接接入（常规地图能力）
  - GPS 厂商透传展示（依赖厂商能力）
- 支持授权状态开关：`UNCONFIRMED`、`AUTHORIZED`、`RESTRICTED`
- 授权未确认时，默认禁用高风险能力

## 5. 核心业务规则

- 每月免费查询次数默认2次（支持后台配置）
- 违章查询超额后策略可配置：拒绝/审批后执行/付费执行
- 成本按“单车单次”计费，必须落库并可审计
- 轨迹数据最小化存储，按合规要求设置保留周期
- 所有第三方调用需记录请求链路与返回结果

## 6. 关键流程伪代码

### 6.1 批量违章查询流程

```pseudo
FUNCTION runBatchViolationQuery(tenantId, vehicleIds, operatorId):
  quota = getMonthlyQuota(tenantId, currentMonth)
  used = getUsedQuota(tenantId, currentMonth)
  IF used >= quota.limit:
    RETURN error("QUOTA_EXCEEDED")

  taskId = createTask(status=PENDING, totalVehicles=vehicleIds.length)
  markTaskRunning(taskId)

  FOR vehicleId IN vehicleIds:
    v = loadVehicle(vehicleId)  // plate, engine_no, vin, vehicle_type_code
    result = callShumaiViolationApi(v)  // provider=SHUMAI, unit_cost=0.06
    saveVehicleResult(taskId, vehicleId, result)
    writeCostLedger(taskId, vehicleId, unit_cost=0.06, if result.billable)

  summary = aggregateTaskResult(taskId)
  saveTaskSummary(taskId, summary)
  increaseQuotaUsage(tenantId, currentMonth, 1)
  RETURN success(taskId, summary)
```

### 6.2 GPS实时定位流程

```pseudo
FUNCTION getVehicleLocation(vehicleId):
  cache = readLocationCache(vehicleId)
  IF cache is valid:
    RETURN cache

  response = callGpsProviderRealtimeApi(vehicleId)
  normalized = normalizeGpsPayload(response)
  saveLocationCache(vehicleId, normalized, ttl=30s)
  RETURN normalized
```

## 7. 非功能要求

- 可用性：扩展模块月可用性 >= 99.5%
- 性能：批量违章任务创建接口 P95 < 300ms
- 稳定性：第三方接口失败重试成功率 >= 95%
- 安全性：密钥托管、敏感日志脱敏、调用全审计

## 8. 里程碑建议

- 第1周：需求冻结、字段定义、接口联调准备
- 第2周：违章批量+配额+成本统计
- 第3周：GPS定位+轨迹+地图策略
- 第4周：联调、压测、验收与上线

## 9. 交付物清单

- 需求补充文档（本文件）
- 第三方接口与成本控制文档
- 商务报价与里程碑文档
- 验收标准与交付清单文档
