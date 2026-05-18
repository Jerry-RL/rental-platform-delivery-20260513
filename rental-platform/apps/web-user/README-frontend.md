# web-user 接手说明

## 1. 项目定位

`web-user` 是用户端流程台，覆盖：

- 核心租车链路：注册/登录、查车、下单、账单、对公支付
- 扩展演示链路：到期提醒摘要、违章任务状态、起点位置、GPS实时/轨迹

## 2. 目录结构（当前）

- `src/main.tsx`：应用入口，挂载 `EntryApp`
- `src/EntryApp.tsx`：页面容器与模块编排（轻逻辑）
- `src/hooks/useUserBookingFlow.ts`：核心下单/账单流程状态与动作
- `src/hooks/useUserExtensionFlow.ts`：扩展功能状态与动作
- `src/services/userService.ts`：业务 API 服务层
- `src/lib/api.ts`：底层请求封装（支持 mock/real/fallback）
- `src/config/runtime.ts`：运行时环境读取
- `src/features/panels/*`：UI 面板组件
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

- `VITE_USE_MOCK_MODE=true`：强制 mock，全流程可演示
- `VITE_MOCK_FALLBACK=true`：真实请求异常时自动回退 mock

## 5. 联调建议

- 正式联调：`VITE_USE_MOCK_MODE=false` + `VITE_MOCK_FALLBACK=false`
- 半联调阶段：`VITE_USE_MOCK_MODE=false` + `VITE_MOCK_FALLBACK=true`
- 客户演示：`VITE_USE_MOCK_MODE=true`

## 6. 新增功能开发规范

- 类型先行：先改 `features/types.ts`
- API 下沉：新增接口放到 `services/userService.ts`
- 流程编排：状态和动作放到 `hooks`
- 组件只做展示：`features/panels` 不做复杂业务逻辑
- `EntryApp.tsx` 保持为装配层，避免再次“巨石化”
