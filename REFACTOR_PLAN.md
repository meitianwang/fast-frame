# Sub2API → 通用 SaaS 基础框架 重构计划

## 目标

将 Sub2API 从 AI API 网关平台精简为**通用 SaaS 基础框架**，保留支付、前后台、门户、认证等通用能力，移除所有 AI 模型/网关相关的业务代码，使其可用于快速开发不同的业务场景。

## 原则

- **先断依赖，再删代码**：每一步都确保编译通过再进入下一步
- **由外到内**：前端路由/UI → 后端路由 → Handler → Service → Schema
- **保留数据库迁移历史**：不删除已有迁移文件，通过新迁移清理废弃表/字段
- **每个 Phase 独立可编译、可运行**

---

## 当前代码量估算

| 层 | 总文件数 | 保留 | 移除 |
|----|---------|------|------|
| 后端 service/ | ~439 | ~100 | ~339 |
| 后端 handler/ | ~125 | ~58 | ~67 |
| 后端 routes/ | 10 | 8 | 2 |
| 数据库 schema | 28 | 18 | 10 |
| 前端 views | 38 | 32 | 6+ |
| 前端 components | ~95 | ~66 | ~29 |
| 前端 api/ | 35 | 23 | 12 |
| 前端 composables | 16 | 11 | 5 |

---

## Phase 0: 准备工作

### 0.1 确保当前状态可编译可测试
```bash
cd backend && make build && make test
cd frontend && pnpm build
```

### 0.2 记录当前测试基线
- 记录通过的测试数量，后续每个 Phase 完成后对比

---

## Phase 1: 前端清理

影响最小、风险最低，先从前端开始。

### 1.1 移除 AI 相关页面 (views)

**删除文件：**
```
frontend/src/views/admin/AccountsView.vue
frontend/src/views/admin/GroupsView.vue
frontend/src/views/admin/ProxiesView.vue
frontend/src/views/admin/UsageView.vue
frontend/src/views/admin/ops/                    # 整个目录
frontend/src/views/user/KeysView.vue
frontend/src/views/user/SoraView.vue
frontend/src/views/user/UsageView.vue
```

### 1.2 移除 AI 相关组件 (components)

**删除文件/目录：**
```
# Sora 组件（整个目录）
frontend/src/components/sora/

# AI 账号管理组件
frontend/src/components/admin/account/

# AI 用量组件
frontend/src/components/admin/usage/

# AI 代理组件
frontend/src/components/admin/proxy/

# AI 分组费率组件
frontend/src/components/admin/group/GroupRateMultipliersModal.vue

# AI 图表组件
frontend/src/components/charts/EndpointDistributionChart.vue
frontend/src/components/charts/GroupDistributionChart.vue
frontend/src/components/charts/ModelDistributionChart.vue
frontend/src/components/charts/TokenUsageTrend.vue
frontend/src/components/charts/UserBreakdownSubTable.vue

# API Key 相关（AI 特有）
frontend/src/components/keys/EndpointPopover.vue
frontend/src/components/keys/UseKeyModal.vue
```

### 1.3 移除 AI 相关 API 调用

**删除文件：**
```
frontend/src/api/sora.ts
frontend/src/api/admin/accounts.ts
frontend/src/api/admin/proxies.ts
frontend/src/api/admin/groups.ts
frontend/src/api/admin/usage.ts
frontend/src/api/admin/ops.ts
frontend/src/api/admin/gemini.ts
frontend/src/api/admin/antigravity.ts
frontend/src/api/admin/scheduledTests.ts
frontend/src/api/admin/tlsFingerprintProfile.ts
```

### 1.4 移除 AI 相关 Composables

**删除文件：**
```
frontend/src/composables/useAccountOAuth.ts
frontend/src/composables/useAntigravityOAuth.ts
frontend/src/composables/useGeminiOAuth.ts
frontend/src/composables/useOpenAIOAuth.ts
frontend/src/composables/useModelWhitelist.ts
```

### 1.5 清理路由 (router/index.ts)

移除以下路由条目：
- `/admin/accounts` — AI 账号管理
- `/admin/groups` — AI 分组管理
- `/admin/proxies` — 代理管理
- `/admin/usage` — AI 用量
- `/admin/ops` — Ops 监控
- `/user/keys` — API Key 管理（AI 网关用）
- `/user/usage` — 用户用量
- `/user/sora` — Sora 客户端

### 1.6 清理侧边栏 (AppSidebar.vue)

移除导航项：
- 管理员：Accounts、Groups、Proxies、Usage、Ops
- 用户：Keys、Usage、Sora

### 1.7 清理 Settings 页面 (SettingsView.vue)

移除 Gateway 标签页及其相关配置项（OpenAI/Anthropic/Gemini 网关配置）。

### 1.8 清理 Dashboard 页面

- 管理员 Dashboard：移除模型分布、Token 用量趋势等 AI 指标卡片
- 用户 Dashboard：移除 Token 用量相关展示

### 1.9 验证
```bash
cd frontend && pnpm build
```

**提交：** `refactor: remove AI-specific frontend pages, components, and routes`

---

## Phase 2: 后端路由与 Handler 清理

### 2.1 移除网关路由文件

**删除文件：**
```
backend/internal/server/routes/gateway.go
backend/internal/server/routes/gateway_test.go
backend/internal/server/routes/sora_client.go
```

**修改 `router.go`：** 移除对 `RegisterGatewayRoutes` 和 `RegisterSoraClientRoutes` 的调用。

### 2.2 清理 Admin 路由 (routes/admin.go)

移除以下路由组注册：
- `/admin/accounts` — 账号 CRUD
- `/admin/openai` — OpenAI OAuth
- `/admin/sora` — Sora OAuth
- `/admin/gemini` — Gemini OAuth
- `/admin/antigravity` — Antigravity OAuth
- `/admin/ops` — Ops 监控相关所有端点
- `/admin/proxies` — 代理管理
- `/admin/groups` — AI 分组（注意：保留通用的 group 概念，仅移除 AI 特有的路由如 rate-multipliers）
- `/admin/usage` — AI 用量统计
- `/admin/error-passthrough` — 错误透传规则
- `/admin/tls-fingerprint-profiles` — TLS 指纹
- `/admin/scheduled-tests` — 定时测试

### 2.3 清理 User 路由 (routes/user.go)

移除：
- 网关使用相关端点
- Sora 客户端端点

### 2.4 移除 AI 相关 Handler 文件

**handler/ 根目录删除：**
```
# 网关核心
gateway_handler.go, gateway_handler_chat_completions.go, gateway_handler_responses.go
gateway_handler_*.go (所有 gateway 相关)
gateway_helper.go, gateway_helper_*.go

# 平台特有
gemini_v1beta_handler.go
openai_chat_completions.go, openai_gateway_handler.go
sora_client_handler.go, sora_gateway_handler.go

# 辅助
endpoint.go, failover_loop.go
idempotency_helper.go
ops_error_logger.go
usage_handler.go
user_msg_queue_helper.go

# 以上各文件的测试文件
```

**handler/admin/ 删除：**
```
account_handler.go, account_data.go, account_today_stats_cache.go
antigravity_oauth_handler.go
gemini_oauth_handler.go
openai_oauth_handler.go
group_handler.go (AI 分组管理部分)
ops_*_handler.go (全部 ops handler)
proxy_handler.go, proxy_data.go
usage_handler.go
error_passthrough_handler.go
```
以及以上各文件的测试文件。

### 2.5 更新 Handler DI (handler/wire.go)

- 从 `AdminHandlers` struct 中移除 AI 相关 handler 字段
- 从 `Handlers` struct 中移除 `OpenAIGatewayHandler`, `SoraGatewayHandler`, `SoraClientHandler`
- 更新 `NewAdminHandlers` 和 `NewHandlers` 构造函数
- 从 `handler.ProviderSet` 中移除已删除的 handler provider

### 2.6 更新 handler/dto/

检查 `handler/dto/` 目录，移除 AI 特有的 DTO 定义（如 account request/response、gateway request/response、ops 相关 DTO）。

### 2.7 验证
```bash
cd backend && go build ./...
```

**提交：** `refactor: remove AI-specific routes and handlers`

---

## Phase 3: 后端 Service 层清理

这是工作量最大的一步，需要分批进行。

### 3.1 移除平台特有 Service 文件

**按平台分批删除：**

**OpenAI（~60 文件）：**
```
openai_*.go                    # OAuth、Token Provider、模型映射、网关等
openai_ws_*.go                 # WebSocket 转发
openai_ws_v2/                  # WebSocket v2 目录
```

**Anthropic/Claude（~10 文件）：**
```
anthropic_session.go
claude_code_*.go
claude_token_provider.go
```

**Antigravity（~20 文件）：**
```
antigravity_*.go               # 所有 antigravity 相关
```

**Gemini（~15 文件）：**
```
gemini_*.go
geminicli_codeassist.go
```

**Sora（~15 文件）：**
```
sora_*.go
```

**Bedrock（~5 文件）：**
```
bedrock_*.go
```

### 3.2 移除网关核心 Service

```
gateway_*.go                   # 网关路由、账号选择、流式处理
error_passthrough_*.go         # 错误透传
sse_scanner_buffer_pool.go     # SSE 流式扫描
```

### 3.3 移除 Ops 监控 Service

```
ops_*.go                       # 全部 ops 相关（~50 文件）
```

### 3.4 移除账号池与调度 Service

```
account*.go                    # 账号管理（~22 文件）
scheduler_*.go                 # 调度器
sticky_session*.go             # 粘性会话
rpm_cache.go                   # RPM 缓存
session_limit_cache.go
overload_cooldown*.go
```

### 3.5 移除其他 AI 特有 Service

```
oauth_refresh_api.go           # AI OAuth 刷新
oauth_service.go               # AI OAuth 服务
proxy_service.go, proxy.go     # AI 代理
proxy_latency_cache.go
quota_fetcher.go               # AI 配额
model_pricing.go               # AI 模型定价
model_rate_limit.go            # AI 模型限速
ratelimit_service.go           # AI 请求限速
scheduled_test_*.go            # 定时测试
temp_unsched*.go
tls_fingerprint_profile_service.go
digest_session_store.go
deferred_service.go
domain_constants.go            # 检查后选择性保留
header_util.go                 # 检查后选择性保留
http_upstream_port.go
metadata_userid.go
refresh_token_cache.go
```

### 3.6 精简保留的 Service

以下 service 需要**保留但修改**，去除 AI 相关逻辑：

| Service | 修改内容 |
|---------|---------|
| `admin_service.go` | 移除 Account CRUD、Privacy、Credentials 方法，保留 User/Setting 管理 |
| `billing_service.go` | 移除 token 计费逻辑，保留通用计费框架或清空待后续业务填充 |
| `billing_cache_service.go` | 同上 |
| `usage_service.go` | 移除 token 统计，保留通用用量框架 |
| `usage_log.go` | 移除 AI token 字段的引用 |
| `dashboard_service.go` | 移除模型/账号统计，保留用户/收入统计 |
| `dashboard_aggregation_service.go` | 同上 |
| `setting_service.go` | 移除 AI 特有的 setting key 解析（sora_*, gemini_*, fallback_model_*） |
| `group_service.go` | 移除 platform、AI 定价字段引用，保留通用分组逻辑 |
| `group.go` | 同上 |
| `group_capacity_service.go` | 检查是否还有通用价值 |
| `api_key_service.go` | 移除对 AI gateway 的引用，保留 key CRUD |
| `concurrency_service.go` | 移除 AI 请求并发跟踪，保留通用并发控制 |
| `subscription_service.go` | 移除对 AI group platform 的引用 |
| `user_group_rate_resolver.go` | 简化，移除 AI 模型费率乘数逻辑 |

### 3.7 更新 Service DI (service/wire.go)

- 从 `service.ProviderSet` 中移除所有已删除的 service provider
- 更新保留 service 的构造函数签名（移除对已删除 service 的依赖注入）

### 3.8 更新顶层 DI (cmd/server/wire.go)

- 移除 AI service 的 provider 引用
- 更新 cleanup 函数（移除已删除 service 的 `Stop()` 调用）
- 重新生成 wire_gen.go：`cd backend && wire ./cmd/server/`

### 3.9 验证
```bash
cd backend && go build ./... && go test ./...
```

**提交：** `refactor: remove AI-specific services`

---

## Phase 4: 数据库 Schema 清理

### 4.1 移除 AI 特有 Ent Schema

**删除文件：**
```
backend/ent/schema/account.go
backend/ent/schema/account_group.go
backend/ent/schema/usage_log.go
backend/ent/schema/usage_cleanup_task.go
backend/ent/schema/proxy.go
backend/ent/schema/tls_fingerprint_profile.go
backend/ent/schema/error_passthrough_rule.go
```

### 4.2 精简 Group Schema

修改 `backend/ent/schema/group.go`：

**移除字段：**
- `platform` — AI 平台标识
- `subscription_type` — AI 订阅类型
- `image_price_*`, `sora_*_price_*` — AI 定价字段
- `supported_model_scopes` — AI 模型范围
- `allow_messages_dispatch`, `require_oauth_only`, `require_privacy_set` — AI 特有配置
- 其他 AI 特有的配置字段

**移除 Edges：**
- 与 Account 的多对多关系
- 与 UsageLog 的一对多关系
- 与 Proxy 的关系

**保留字段：**
- `name`, `display_name`, `description` — 基础信息
- 通用配额/限制字段

### 4.3 精简 API Key Schema

修改 `backend/ent/schema/api_key.go`：
- 保留基础字段：key, name, user_id, group_id, enabled, expires_at
- 保留通用配额字段：quota, quota_used, rate_limit
- 检查并移除 AI gateway 特有字段

### 4.4 重新生成 Ent 代码

```bash
cd backend && go generate ./ent
```

这会重新生成所有 Ent client 代码。生成后需要修复所有引用了已删除实体的编译错误。

### 4.5 创建数据库迁移

新建迁移文件 `backend/migrations/XXX_strip_ai_tables.sql`：

```sql
-- Drop AI-specific tables
DROP TABLE IF EXISTS account_groups CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS usage_cleanup_tasks CASCADE;
DROP TABLE IF EXISTS proxies CASCADE;
DROP TABLE IF EXISTS tls_fingerprint_profiles CASCADE;
DROP TABLE IF EXISTS error_passthrough_rules CASCADE;

-- Drop AI-specific columns from groups
ALTER TABLE groups DROP COLUMN IF EXISTS platform;
ALTER TABLE groups DROP COLUMN IF EXISTS subscription_type;
-- ... 其他 AI 字段
```

### 4.6 验证
```bash
cd backend && go generate ./ent && go build ./... && go test ./...
```

**提交：** `refactor: remove AI-specific database schemas and create cleanup migration`

---

## Phase 5: Repository 层清理

### 5.1 移除 AI 特有 Repository 文件

```
backend/internal/repository/claude_oauth_service.go
backend/internal/repository/claude_usage_service.go
backend/internal/repository/gemini_*.go
backend/internal/repository/geminicli_codeassist_client.go
backend/internal/repository/openai_oauth_service.go
backend/internal/repository/ops_repo*.go
backend/internal/repository/sora_*.go
backend/internal/repository/github_release_service.go
```
以及以上各文件的测试文件。

### 5.2 精简保留的 Repository

检查以下 repository 文件，移除对已删除 schema 的引用：
- 引用 `ent.Account` 的 repository
- 引用 `ent.UsageLog` 的 repository
- 引用 `ent.Proxy` 的 repository

### 5.3 验证
```bash
cd backend && go build ./... && go test ./...
```

**提交：** `refactor: remove AI-specific repository layer`

---

## Phase 6: Pkg 清理

### 6.1 移除 AI 特有 pkg 子目录

```
backend/internal/pkg/antigravity/
backend/internal/pkg/claude/
backend/internal/pkg/gemini/
backend/internal/pkg/geminicli/
backend/internal/pkg/openai/
```

### 6.2 检查其他 pkg

- `pkg/proxyurl/`, `pkg/proxyutil/` — 如果仅被 AI 代理使用则移除
- `pkg/tlsfingerprint/` — 如果仅被 AI 代理使用则移除
- `pkg/usagestats/` — 检查是否有通用价值

### 6.3 验证
```bash
cd backend && go build ./... && go test ./...
```

**提交：** `refactor: remove AI-specific pkg modules`

---

## Phase 7: Integration 测试与杂项清理

### 7.1 清理 Integration 测试

**删除：**
```
backend/internal/integration/e2e_gateway_test.go
```

**保留：**
```
backend/internal/integration/e2e_user_flow_test.go
backend/internal/integration/e2e_helpers_test.go
```

### 7.2 清理 model 层

检查 `backend/internal/model/`，移除：
- `error_passthrough_rule.go` — 如果 schema 已删除
- `tls_fingerprint_profile.go` — 如果 schema 已删除

### 7.3 清理文档与资产

- 更新 `README.md` — 移除 AI 网关相关描述，改为通用 SaaS 框架描述
- 更新 `README_CN.md`, `README_JA.md` — 同上
- 更新 `DEV_GUIDE.md` — 移除 AI 相关开发指南
- 清理 `docs/` 目录
- 清理 `assets/` 中 AI 相关的图片资源

### 7.4 清理 deploy 配置

检查 `deploy/` 目录，移除 AI 特有的环境变量和配置项。

### 7.5 清理 Makefile

检查根目录和 backend 的 Makefile，移除 AI 特有的 target。

### 7.6 清理 Dockerfile

检查 Dockerfile，移除 AI 特有的构建步骤或环境变量。

### 7.7 清理 frontend 残留

- 检查 `frontend/src/i18n/` — 移除 AI 相关的翻译 key
- 检查 `frontend/src/types/` — 移除 AI 相关的类型定义
- 检查 `frontend/src/utils/` — 移除 AI 相关的工具函数

### 7.8 验证
```bash
cd backend && make build && make test
cd frontend && pnpm build
```

**提交：** `refactor: cleanup tests, docs, and miscellaneous AI references`

---

## Phase 8: 最终验证与品牌重塑

### 8.1 全量编译验证

```bash
# 后端
cd backend && go build ./... && go vet ./... && go test ./...

# 前端
cd frontend && pnpm build && pnpm test
```

### 8.2 功能验证清单

- [ ] 用户注册/登录/登出
- [ ] 密码找回
- [ ] TOTP 二步验证
- [ ] OAuth 登录（LinuxDo）
- [ ] 管理员 Dashboard
- [ ] 用户管理（创建/编辑/删除/搜索）
- [ ] 订阅计划管理
- [ ] 支付流程（创建订单 → 支付 → 回调）
- [ ] 兑换码功能
- [ ] 优惠码功能
- [ ] 公告系统
- [ ] 系统设置
- [ ] 数据备份/导出
- [ ] 邮件发送
- [ ] 前端 i18n 切换

### 8.3 品牌重塑（可选）

- 项目名从 Sub2API 改为新名称
- 更新所有 import path
- 更新前端 title、logo
- 更新 go.mod module path

### 8.4 最终提交

```bash
git add -A && git commit -m "refactor: strip AI business logic, retain generic SaaS framework"
```

---

## 风险与注意事项

### 高风险点

1. **Wire 依赖注入链断裂**：移除 service 后 wire 无法生成，需要反复 `wire ./cmd/server/` 调试
2. **Ent 代码重新生成**：删除 schema 后 `go generate ./ent` 会重新生成大量代码，可能产生级联编译错误
3. **Group 实体纠缠**：Group 同时承载 AI 分组和通用用户分组功能，需要小心剥离 AI 字段而不破坏通用逻辑
4. **Settings 交织**：AI 配置项和通用配置项混在同一个 parseSettings 方法中

### 缓解措施

- 每个 Phase 结束后立即编译验证
- Phase 3（Service 清理）工作量最大，可进一步拆分为多个子提交
- 对 Group 实体，建议先移除 AI 字段，保留 Group 的通用分组功能
- 对 billing/usage，如果通用价值不高可以整体移除，后续按新业务需求重建

### 预估工作量

| Phase | 描述 | 预估文件变动 |
|-------|------|-------------|
| Phase 1 | 前端清理 | ~60 文件删除, ~5 文件修改 |
| Phase 2 | 路由与 Handler | ~70 文件删除, ~10 文件修改 |
| Phase 3 | Service 层 | ~340 文件删除, ~20 文件修改 |
| Phase 4 | 数据库 Schema | ~10 文件删除, ~3 文件修改, Ent 重新生成 |
| Phase 5 | Repository 层 | ~20 文件删除, ~5 文件修改 |
| Phase 6 | Pkg 清理 | ~5 目录删除 |
| Phase 7 | 杂项清理 | ~10 文件修改 |
| Phase 8 | 验证 | 0 文件变动 |
| **总计** | | **~510 文件删除, ~53 文件修改** |
