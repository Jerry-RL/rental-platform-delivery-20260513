# web-admin 接手说明

## 1. 项目定位

`web-admin` 是管理端联调台，覆盖两类能力：

- 核心流程：订单查询、支付回调、提车/还车、发票
- 扩展流程：批量违章、配额成本、到期提醒、地图策略、GPS快照

## 2. 目录结构（当前）

- `src/main.tsx`：应用入口，挂载 `EntryApp`
- `src/EntryApp.tsx`：页面容器与面板编排（轻逻辑）
- `src/hooks/useAdminCoreFlow.ts`：核心交易流程状态与动作
- `src/hooks/useAdminOpsFlow.ts`：扩展运营流程状态与动作
- `src/services/adminService.ts`：业务 API 服务层（统一调用）
- `src/lib/api.ts`：底层请求封装（支持 mock/real/fallback）
- `src/config/runtime.ts`：运行时环境读取
- `src/features/panels/*`：各模块 UI 面板组件
- `src/features/types.ts`：业务类型定义

## 3. 运行方式

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

## 4. 环境变量

复制 `.env.example` 到 `.env`：

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_USE_MOCK_MODE=false
VITE_MOCK_FALLBACK=true
```

说明：

- `VITE_USE_MOCK_MODE=true`：强制 mock，不请求真实后端
- `VITE_MOCK_FALLBACK=true`：真实请求失败自动回退 mock

## 5. 联调建议

- 后端已就绪：`VITE_USE_MOCK_MODE=false` + `VITE_MOCK_FALLBACK=false`
- 后端部分就绪：`VITE_USE_MOCK_MODE=false` + `VITE_MOCK_FALLBACK=true`
- 纯演示环境：`VITE_USE_MOCK_MODE=true`

## 6. 新增功能开发规范

- 先在 `features/types.ts` 补类型
- 再在 `services/adminService.ts` 增加 API 方法
- 在 `hooks` 里组织状态与交互动作
- 最后在 `features/panels` 增加/修改展示组件
- 避免把业务逻辑直接写回 `EntryApp.tsx`
