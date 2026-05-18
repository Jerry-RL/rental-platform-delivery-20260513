# API 统一规范（requestId / 分页 / 排序 / 过滤）

## 1. RequestId
- 请求头：`X-Request-Id`（可选，客户端不传由网关生成）
- 响应体：统一返回 `requestId`

## 2. 分页
- `pageNum`：页码，从 1 开始，默认 1
- `pageSize`：每页条数，默认 20，最大 200

## 3. 排序
- `sortBy`：排序字段
- `sortOrder`：`asc` / `desc`

## 4. 过滤
- `filter`：JSON 字符串，约定简单键值过滤
- 示例：`{"status":"CONFIRMED","city":"Shanghai"}`

## 5. 响应分页结构
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [],
    "pageNum": 1,
    "pageSize": 20,
    "total": 100
  },
  "timestamp": "2026-05-13T10:00:00Z",
  "requestId": "req_xxx"
}
```
