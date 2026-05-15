# OVH 抢购管理系统

> 基于 [coolci/OVH-BUY](https://github.com/coolci/OVH-BUY) 重构的全栈 OVH 服务器自动抢购系统。
> 全中文界面，前后端模块化，安全加固，Docker 一键部署。

![dashboard](docs/dashboard.png)

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 19 · TanStack Router · TanStack Query · Tailwind CSS v4 · Recharts · shadcn/ui |
| 后端 | Go 1.23 · Gin · GORM · golang-jwt v5 · go-redis v9 · zap |
| 数据 | PostgreSQL 15 · Redis 7 |
| 部署 | Docker · Docker Compose · Nginx |

## 功能模块

- ✅ **用户系统**：注册、登录、JWT 鉴权、RBAC（管理员/普通用户）
- ✅ **多账号管理**：支持配置多个 OVH 账号（凭证 AES-256-GCM 加密存储）
- ✅ **服务器型号**：拉取并缓存 OVH 在售型号、地区库存
- ✅ **抢购任务**：定时/即时抢购、并发控制、失败指数退避重试
- ✅ **订单记录**：完整抢购历史、状态追踪
- ✅ **运行日志**：所有 OVH API 调用、抢购尝试结构化日志
- ✅ **通知系统**：Telegram、SMTP 邮件
- ✅ **Dashboard**：Superset 风格实时统计面板

> 当前为 **第 1 期**：完成前端设计系统、登录注册、Dashboard 框架、Go 后端骨架、Docker 一键部署。
> 后续 3 期将依次实现 OVH 客户端、抢购引擎、通知与日志模块。

## 安全特性

- 🔒 **密码**：bcrypt cost=12
- 🔒 **JWT**：HS256，access token 短期 (15 min)
- 🔒 **OVH 凭证**：AES-256-GCM 加密，密钥独立管理
- 🔒 **限流**：基于 Redis 的 IP/用户级限流（登录 20/min，API 120/min）
- 🔒 **输入校验**：前端 zod + 后端 `go-playground/validator`
- 🔒 **审计日志**：所有敏感操作（登录、账号增删、抢购触发）记录到 `audit_logs`
- 🔒 **CORS**：白名单
- 🔒 **SQL 注入**：GORM 全部参数化
- 🔒 **Docker**：非 root 用户运行；机密只通过 env 注入
- 🔒 **响应头**：X-Frame-Options / X-Content-Type-Options / Referrer-Policy

## 一键部署

### 1. 准备环境
- Docker ≥ 20.10
- Docker Compose v2

### 2. 配置环境变量
```bash
cp .env.example .env
# 然后编辑 .env，必须修改：
#   POSTGRES_PASSWORD、REDIS_PASSWORD、JWT_SECRET、APP_ENCRYPTION_KEY
#   APP_ENCRYPTION_KEY 必须正好 32 字节，可用 openssl rand -hex 16 生成
```

### 3. 启动
```bash
docker compose up -d --build
```

访问 http://localhost:8000 ，第一个注册的用户自动成为管理员。

### 4. 常用命令
```bash
docker compose logs -f backend         # 查看后端日志
docker compose logs -f frontend        # 查看前端日志
docker compose restart backend         # 重启后端
docker compose down -v                 # 停止并清空数据（危险）
```

## 目录结构

```text
.
├── src/                  # 前端 React (TanStack Start)
│   ├── components/       # UI 组件 (AppShell, KpiCard, Panel)
│   ├── lib/              # API 客户端、Auth Provider
│   └── routes/           # 文件路由：login, register, _authenticated/*
├── backend/              # Go 后端
│   ├── cmd/server/       # 程序入口
│   └── internal/
│       ├── api/          # Gin 路由装配
│       ├── auth/         # bcrypt + JWT
│       ├── config/       # 配置加载
│       ├── crypto/       # AES-256-GCM
│       ├── handler/      # HTTP 处理器
│       ├── middleware/   # 鉴权 / 限流 / 日志 / CORS
│       ├── model/        # GORM 数据模型
│       └── store/        # PostgreSQL & Redis 连接
├── nginx/                # 前端静态资源 + API 反代配置
├── docker-compose.yml
├── Dockerfile            # 前端镜像
└── backend/Dockerfile    # 后端镜像
```

## 开发模式

### 前端
```bash
bun install
bun run dev            # http://localhost:5173
```
默认通过 `VITE_API_BASE_URL=/api` 代理到后端，本地开发时建议配合 `docker compose up postgres redis backend` 启动依赖与后端。

### 后端
```bash
cd backend
go mod tidy
go run ./cmd/server
```
需先在环境变量中提供 `DATABASE_URL`、`REDIS_URL`、`JWT_SECRET`、`APP_ENCRYPTION_KEY`。

## 路线图

- [x] 第 1 期：基础架构（本期）
- [ ] 第 2 期：OVH API 客户端 + 多账号 + 型号目录
- [ ] 第 3 期：抢购任务调度引擎 + 订单
- [ ] 第 4 期：通知系统 + 完整日志/审计 + 真实统计

## 法律声明

本项目仅用于学习与个人合规使用。请遵守 OVH 的使用条款，不要用于商业刷单或其他违反 OVH 政策的行为。
作者不对使用本项目导致的任何账号封禁或法律后果负责。

## License

MIT
