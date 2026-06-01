# GPS / 视频物联 — 备选方案对接说明（v1）

版本：1.0  
日期：2026-06-01  
关联需求：FR-EXT-004、FR-EXT-006、BR-026~028、AC-015

---

## 1. 选型策略

平台通过 **Integration Adapter** 统一接入 GPS/视频物联能力，一期支持两家**备选供应商**（客户已接洽），实施阶段择一为主、另一家作备份或分车队试点。

| 优先级 | 平台编码 | 供应商（客户口径） | 定位 | 典型协议/对接 |
|---|---|---|---|---|
| 备选 A | `TUQIANG` | **图强 / 途强物联** | 定位为主，可选视频终端 | HTTP/HTTPS API、MQTT；开放平台 |
| 备选 B | `CHENGZAI_VIDEO_IOT` | **承载视频物联** | 定位 + 车载视频一体 | JT/T 808 + JT/T 1078（部标） |

> **命名说明**：客户所称「图强」与市面品牌 **「途强物联」**（深圳市途强物联科技有限公司）为同一类车载定位服务商，下文统一记为 **图强（途强物联）**。官方站点：[tuqiang.com.cn](https://www.tuqiang.com.cn/)

---

## 2. 备选 A：图强（途强物联）

### 2.1 厂商概况

| 项 | 内容 |
|---|---|
| 公司 | 深圳市途强物联科技有限公司 |
| 官网 | https://www.tuqiang.com.cn/ |
| 应用 | 途强物联 App（车辆列表、实时跟踪、轨迹回放等） |
| 客服 | 400-030-5855（官网公示，以最新为准） |

### 2.2 能力范围（对接目标）

| 能力 | 一期 | 说明 |
|---|---|---|
| 实时定位 | P0 | 经纬度、速度、方向、定位时间、在线状态 |
| 历史轨迹 | P0 | 按车辆 + 时间范围查询轨迹点 |
| 设备管理 | P1 | 终端编号与平台 `vehicle` 绑定 |
| 电子围栏/报警 | P2 | 可复用厂商规则，平台侧仅消费告警事件 |
| 视频 | P2 | 若终端带视频能力，二期经厂商 SDK/页面嵌入 |

### 2.3 对接方式（建议）

- **开放 API / SDK**：车辆定位数据与企业平台对接（官网「平台对接」能力）。
- **协议**：HTTP/HTTPS；部分场景支持 **MQTT** 推送。
- **安全**：TLS、动态令牌、数据脱敏、权限分级（厂商宣传口径）。
- **终端**：有线/OBD/无线强磁等多款定位器；支持单北斗终端（政企场景）。

### 2.4 平台适配要点

```pseudo
FUNCTION getRealtimeLocation(vehicleId):
  terminal = loadGpsBinding(vehicleId)  // provider=TUQIANG, terminal_no
  raw = tuqiangAdapter.queryLocation(terminal.terminal_no)
  RETURN normalizeLocation(raw)  // lat, lng, speed, heading, located_at, online_status

FUNCTION getTrack(vehicleId, startTime, endTime):
  raw = tuqiangAdapter.queryTrack(terminal_no, startTime, endTime)
  RETURN normalizeTrackPoints(raw)  // 降采样后写入 gps_track 或仅缓存
```

### 2.5 商务与成本

- 计费模式：**设备费 + 平台服务费/流量费**（以途强商务合同为准，文档不写死单价）。
- 200 台车：按 **终端数量 × 年费/月费** 估算；API 调用费通常含在平台套餐内。
- 上线前向厂商索取：**API 文档、测试账号、QPS 限制、轨迹保留天数**。

---

## 3. 备选 B：承载视频物联

### 3.1 厂商概况

| 项 | 内容 |
|---|---|
| 客户口径名称 | **承载视频物联** |
| 能力定位 | 车载 **GPS/北斗定位 + 4G 视频监控** 一体化平台 |
| 官方资料 | 由客户在商务对接时提供（官网、API 文档、测试环境） |

> 公开检索未命中唯一工商主体链接，本文档按客户指定厂商名建档；**接口域名、密钥、报价以厂商交付材料为准**。

### 3.2 能力范围（对接目标）

| 能力 | 一期 | 说明 |
|---|---|---|
| 实时定位 | P0 | 部标 808 位置汇报（0x0200 等）归一化为平台模型 |
| 历史轨迹 | P0 | 平台按时间段拉取或厂商侧回放 |
| 在线状态 | P0 | 终端心跳/离线判断 |
| 实时视频 | P1 | 1078 实时预览（管理端/Web，可选） |
| 录像回放 | P2 | 1078 历史录像；租车纠纷取证 |
| 报警 | P1 | 超速、围栏、断电等事件订阅 |

### 3.3 对接方式（建议）

行业标准车载平台常见架构，承载视频物联**预期**兼容：

| 协议 | 用途 |
|---|---|
| **JT/T 808**（2011/2013/2019） | 终端注册、鉴权、位置汇报、报警、指令下发 |
| **JT/T 1078** | 实时音视频、录像回放、云台控制 |
| 可选 **GB/T 28181** | 若平台走国标视频级联，用于 IPC/NVR 接入 |

**对接路径（二选一，联调时确认）**

1. **厂商开放平台 API**（REST）：查询位置、轨迹、视频流地址 — 优先，与违章数脉模式一致。  
2. **部标网关直连**：平台自建/共建 JT808 网关接收终端上报（工作量大，仅当厂商仅提供网关接入时考虑）。

### 3.4 平台适配要点

```pseudo
FUNCTION getRealtimeLocation(vehicleId):
  terminal = loadGpsBinding(vehicleId)  // provider=CHENGZAI_VIDEO_IOT, sim/terminal_id
  raw = chengZaiAdapter.queryLocation(terminal.terminal_id)
  RETURN normalizeLocation(raw)

FUNCTION getLiveVideoUrl(vehicleId, channelNo):
  // 可选 P1；返回 HLS/FLV/WebRTC 播放地址，不落库长期存储码流
  RETURN chengZaiAdapter.requestLiveStream(terminal_id, channelNo)
```

### 3.5 商务与成本

- 计费模式通常为：**车载终端硬件 + 物联网卡流量 + 平台账号费**；视频路数、存储天数影响套餐价。
- 200 台带 1~2 路摄像头：需厂商按 **定位版 / 视频版** 报价（行业常见分档）。
- 与 **地图商用授权**：轨迹展示优先用厂商 H5/插件或 GPS 透传，降低独立地图 SDK 成本（对齐 BR-027）。

---

## 4. 两家方案对比（租车场景）

| 维度 | 图强（途强物联） | 承载视频物联 |
|---|---|---|
| 核心优势 | 定位终端成熟、开放 API、部署轻 | 定位+视频一体，纠纷取证、风控强 |
| 协议 | HTTP/MQTT 为主 | JT808 + JT1078 为主 |
| 实施复杂度 | 低~中（REST 适配） | 中~高（部标/流媒体） |
| 适合场景 | 仅需轨迹调度、资产监控 | 需车内视频、安全驾驶、事故举证 |
| 地图依赖 | 厂商 App/地图或平台地图 | 视频页常自带地图；轨迹可透传 |
| 一期建议 | 先接定位+轨迹 | 若客户已装其终端，可作主方案 |

**选型建议（200 台租赁车队）**

- 现有终端以 **途强/图强** 为主 → 首选 `TUQIANG`，快速上线定位与轨迹。  
- 已部署 **承载** 车载录像机且需视频 → 首选 `CHENGZAI_VIDEO_IOT`，定位与视频统一台账。  
- 长期：Adapter 保留双实现，按 `vehicle.gps_provider` 分车路由。

---

## 5. 平台统一模型与数据

### 5.1 车辆绑定字段（建议）

| 字段 | 类型 | 说明 |
|---|---|---|
| gps_provider | varchar(30) | `TUQIANG` \| `CHENGZAI_VIDEO_IOT` |
| gps_terminal_id | varchar(64) | 厂商终端号 / SIM / 设备 ID |
| gps_sim | varchar(20) | 部标场景常用 |
| gps_bind_at | timestamptz | 绑定时间 |

### 5.2 归一化位置对象

```json
{
  "provider": "TUQIANG",
  "vehicleId": "uuid",
  "latitude": 30.27415,
  "longitude": 120.15515,
  "speedKmh": 42.5,
  "heading": 180,
  "locatedAt": "2026-06-01T10:00:00+08:00",
  "onlineStatus": "ONLINE",
  "address": "浙江省杭州市..."
}
```

### 5.3 存储与合规（BR-026）

- 轨迹落库：**最小必要**；默认保留 **90 天**（可配置）。
- 视频流：**不长期存储** 全量码流；仅记录播放 URL 与操作审计（一期）。
- 缓存：实时位置 Redis TTL **30s**（与需求补充伪代码一致）。

---

## 6. 配置项（后台）

| 配置键 | 说明 |
|---|---|
| gps.default_provider | 默认供应商编码 |
| gps.tuqiang.api_base_url | 途强 API 基址 |
| gps.tuqiang.app_key / secret | 密钥（密钥托管） |
| gps.chengZai.api_base_url | 承载平台 API 基址 |
| gps.chengZai.app_key / secret | 密钥 |
| gps.track.retention_days | 轨迹保留天数 |
| gps.location.cache_ttl_seconds | 实时位置缓存 TTL |

---

## 7. 上线检查清单

### 7.1 通用

- [ ] 每车完成 `gps_provider` + `gps_terminal_id` 绑定
- [ ] Adapter 归一化字段与 OpenAPI `VehicleLocation` / `TrackPoint` 一致
- [ ] 熔断降级：厂商不可用时返回缓存或明确错误码 `4002`/`9001`
- [ ] 调用日志：`provider`、`endpoint`、`request_id`、`latency_ms`

### 7.2 图强（途强）

- [ ] 商务合同与测试账号
- [ ] API 文档：实时位置、历史轨迹、设备列表
- [ ] 200 台终端入网与平台车辆 ID 映射表

### 7.3 承载视频物联

- [ ] 厂商 API 或网关接入方式书面确认
- [ ] 808 位置上报频率与轨迹查询接口联调
- [ ] 1078 实时预览/回放（若一期纳入）
- [ ] 物联网卡与存储套餐与 200 台报价单

---

## 8. 关联文档

- [租车平台第三方接口与成本控制说明.md](../../租车平台第三方接口与成本控制说明.md)
- [租车平台需求补充说明书（违章+GPS+地图）.md](../../租车平台需求补充说明书（违章+GPS+地图）.md)
- [integration-shumai-violation-v1.md](./integration-shumai-violation-v1.md)（违章：数脉）
