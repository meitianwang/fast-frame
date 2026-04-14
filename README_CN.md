# Fast-Frame

**Fast-Frame** 是一个面向生产环境的 SaaS 后端框架，基于 Go 和 Vue 3 构建。它为订阅制服务提供完整的基础设施层，包含用户管理、支付处理、API Key 管理和管理员后台——所有功能打包为单一可部署二进制文件，内嵌前端，无需额外静态资源服务。

[English](README.md)

---

## 功能特性

### 认证与安全
- 邮箱/密码注册登录，附带邮箱验证流程
- OAuth2 社交登录（LinuxDo）
- 两步验证（TOTP），支持二维码扫码绑定
- JWT 认证，access/refresh token 双令牌机制
- Cloudflare Turnstile 人机验证集成
- 基于 Redis 的接口限速（fail-close 策略）
- 安全响应头：CSP nonce 注入、HSTS、X-Frame-Options

### 用户管理
- 个人资料管理（用户名、密码、两步验证设置）
- 账户余额追踪和充值历史记录
- 自定义用户属性扩展字段
- 管理员：完整增删改查、用量统计、余额调整

### 订阅系统
- 订阅组和订阅计划管理，支持灵活定价层级
- 每日/每月消费上限（美元）
- 实时用量进度追踪
- 订阅续期和到期处理
- 有效订阅筛选和汇总统计

### 支付处理
- 内置多支付渠道支持：
  - **Stripe**
  - **支付宝（Alipay）**
  - **微信支付（WeChat Pay）**
  - **EasyPay**
- 支付渠道管理与多实例负载均衡
- 订单全生命周期管理（创建、取消、退款申请）
- 所有支付渠道的 Webhook 回调处理
- 支付数据统计看板

### 营销推广
- 兑换码：余额型或订阅型，支持批量生成和 CSV 导出
- 优惠码：折扣比例、使用次数限制、到期时间管理
- 兑换历史记录追踪

### 管理后台
- 实时监控指标：活跃 API Key 数、请求量、新增用户数
- 用户管理，支持搜索和筛选
- 系统公告，支持定向推送
- SMTP 邮件服务配置和发送测试
- 系统设置可通过 Web 界面管理

### 运维与基础设施
- 兼容 S3 的数据库定时备份与恢复
- 结构化日志 + 日志文件轮转（Zap）
- 关键操作幂等性保障
- 内嵌 Vue 3 前端——单一二进制文件，无需外部静态资源服务
- 首次安装向导（Setup Wizard）

---

## 技术栈

| 层级 | 技术选型 |
|---|---|
| 后端语言 | Go 1.25+ |
| Web 框架 | Gin |
| ORM | Ent |
| 数据库 | PostgreSQL 15+ |
| 缓存 | Redis |
| 前端框架 | Vue 3 + TypeScript |
| 前端构建 | Vite 5 |
| 样式 | TailwindCSS 3 |
| 状态管理 | Pinia |
| 包管理器 | pnpm |

---

## 快速开始

### 环境要求

- Go 1.25+
- Node.js 20+ 及 pnpm
- PostgreSQL 15+
- Redis

### 1. 克隆仓库

```bash
git clone https://github.com/meitianwang/fast-frame.git
cd fast-frame
```

### 2. 启动后端

```bash
cd backend
go run ./cmd/server/
```

首次运行时，服务器检测到没有配置文件，会自动在 `http://localhost:8080` 启动**安装向导**。通过向导完成数据库、JWT 密钥、SMTP 等配置后，生成的 `config.yaml` 将保存到当前工作目录。

### 3. 启动前端开发服务器

另开一个终端：

```bash
cd frontend
pnpm install
pnpm dev
```

前端开发服务器运行在 `http://localhost:3000`，并将 `/api`、`/v1`、`/setup` 路径代理到后端 `http://localhost:8080`。

### 4. 构建生产版本

```bash
make build
```

此命令先构建 Vue 3 前端，再将其嵌入 Go 二进制文件，最终生成单一的自包含可执行文件。

---

## 配置说明

配置存储在工作目录的 `config.yaml` 文件中（由安装向导生成），或存储在 `DATA_DIR` 环境变量指定的路径下。

主要配置节：

| 配置节 | 说明 |
|---|---|
| `server` | 监听地址、端口、可信代理、请求体大小限制 |
| `database` | PostgreSQL 连接信息、连接池配置 |
| `redis` | Redis 连接、连接池、TLS |
| `jwt` | 签名密钥、Token 有效期、刷新窗口 |
| `smtp` | 邮件服务器（用于验证码和通知邮件） |
| `payment` | 各支付渠道凭证和配置 |
| `cors` | 允许的跨域来源 |
| `csp` | 内容安全策略 |
| `log` | 日志级别、格式、文件轮转 |
| `s3` | 备份存储端点和凭证 |

所有配置均可通过环境变量覆盖。管理员设置界面支持在不重启服务器的情况下更新大多数配置。

---

## Docker 部署

```bash
docker build -f backend/Dockerfile -t fast-frame .
docker run -d \
  -p 8080:8080 \
  -e DATA_DIR=/app/data \
  -v /your/data/dir:/app/data \
  fast-frame
```

当 `DATA_DIR` 为空目录时，首次运行会自动启动安装向导。自动化部署场景下，设置 `AUTO_SETUP=true` 并配置所需的环境变量即可跳过交互式向导。

---

## 项目结构

```
fast-frame/
├── backend/
│   ├── cmd/server/          # 应用程序入口
│   ├── ent/                 # Ent ORM Schema 及生成代码
│   ├── internal/
│   │   ├── config/          # 配置加载与类型定义
│   │   ├── domain/          # 领域模型与常量
│   │   ├── handler/         # HTTP 处理器（含 admin/ 子包）
│   │   ├── repository/      # 数据访问层
│   │   ├── service/         # 业务逻辑（含 payment/、admin/）
│   │   ├── server/
│   │   │   ├── middleware/  # 认证、CORS、CSP、限速、日志
│   │   │   └── routes/      # 路由注册
│   │   ├── web/             # 内嵌前端服务
│   │   └── pkg/             # 公共工具库
│   └── migrations/          # 数据库迁移文件
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── auth/        # 登录、注册、密码重置、OAuth 回调
│   │   │   ├── user/        # 个人资料、订阅、购买
│   │   │   ├── admin/       # 控制台、用户、支付、设置等
│   │   │   └── setup/       # 首次安装向导
│   │   ├── components/      # 可复用 Vue 组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── api/             # Axios API 客户端
│   │   └── i18n/            # 国际化配置
│   └── vite.config.ts
├── docs/                    # 补充文档
├── tools/                   # 构建和工具脚本
└── Makefile
```

---

## API 概览

所有 API 端点统一在 `/api/v1/` 路径下进行版本管理。

### 认证
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/v1/auth/register` | 注册新用户 |
| POST | `/api/v1/auth/login` | 邮箱密码登录 |
| POST | `/api/v1/auth/login/2fa` | 完成两步验证 |
| POST | `/api/v1/auth/logout` | 登出 |
| POST | `/api/v1/auth/send-verify-code` | 发送邮箱验证码 |
| POST | `/api/v1/auth/verify-code` | 提交邮箱验证码 |

### 用户（需要 JWT）
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/v1/user/profile` | 获取当前用户信息 |
| PUT | `/api/v1/user` | 更新个人资料 |
| PUT | `/api/v1/user/password` | 修改密码 |
| GET/POST | `/api/v1/user/totp/*` | 两步验证设置与管理 |

### 支付（需要 JWT）
| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/v1/pay/orders` | 创建支付订单 |
| GET | `/api/v1/pay/orders` | 查看用户订单列表 |
| POST | `/api/v1/pay/orders/:id/cancel` | 取消订单 |
| POST | `/api/v1/pay/orders/:id/refund-request` | 申请退款 |
| GET | `/api/v1/pay/subscription-plans` | 获取可用订阅计划 |

### 管理员（需要管理员 API Key 或管理员 JWT）
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/v1/admin/dashboard/realtime` | 实时系统指标 |
| GET/POST/PUT/DELETE | `/api/v1/admin/users/*` | 用户管理 |
| GET/POST/PUT/DELETE | `/api/v1/admin/announcements/*` | 公告管理 |
| POST | `/api/v1/admin/redeem-codes/generate` | 批量生成兑换码 |
| GET/PUT | `/api/v1/admin/settings` | 系统设置 |
| GET/POST | `/api/v1/admin/backups` | 备份管理 |

### 响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": { ... }
}
```

`code: 0` 表示成功，非零值表示错误，`msg` 字段包含具体错误描述。

---

## 开发指南

### 后端测试

```bash
cd backend

# 单元测试
go test -tags=unit ./...

# 集成测试（需要 PostgreSQL 和 Redis）
go test -tags=integration ./...

# 代码检查
golangci-lint run ./...
```

### 前端检查

```bash
cd frontend
pnpm typecheck
pnpm lint:check
```

### 修改 Ent Schema 后重新生成代码

```bash
cd backend
go generate ./ent
```

更多开发细节、常见坑点和环境配置说明，请参阅 [DEV_GUIDE.md](DEV_GUIDE.md)。

---

## License

[LICENSE](LICENSE)
