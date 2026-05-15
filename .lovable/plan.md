# OVH-BUY 全栈重构方案

## 重要前提

当前 Lovable 项目模板是 **TanStack Start（前端 + Lovable Cloud）**，无法直接运行 Go 后端。本方案采用**双仓结构**：
- **前端**：在当前 Lovable 项目中用 React 构建，复刻 Superset 风格 Dashboard
- **后端**：在 `/backend` 目录创建独立 Go 项目，通过 Docker Compose 编排
- **部署**：`docker-compose.yml` 一键启动 前端 + Go API + PostgreSQL + Redis

由于 Lovable 预览只能运行前端，**Go 后端的实际运行/调试需要你在本地或服务器上 `docker compose up`**。

## 目录结构

```text
/
├── src/                      # 前端 React (TanStack Start)
│   ├── routes/               # 登录、Dashboard、抢购配置、订单、日志、设置
│   ├── components/           # UI 组件（侧边栏、卡片、图表、表格）
│   ├── lib/api/              # 调用 Go 后端的封装
│   └── styles.css            # Superset 风格设计系统
├── backend/                  # Go 后端
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── api/              # Gin 路由 + handler
│   │   ├── auth/             # JWT、bcrypt、RBAC
│   │   ├── ovh/              # OVH API 客户端 + 抢购引擎
│   │   ├── scheduler/        # 抢购任务调度（基于 Redis 队列）
│   │   ├── notify/           # Telegram + SMTP
│   │   ├── store/            # PostgreSQL (GORM) + Redis
│   │   ├── model/            # 数据模型
│   │   └── middleware/       # 鉴权、限流、CORS、日志
│   ├── migrations/           # SQL 迁移
│   ├── Dockerfile
│   └── go.mod
├── docker-compose.yml        # 前端 + 后端 + PG + Redis
├── nginx/                    # 反向代理配置
└── .env.example
```

## 功能模块

### 后端 API（Go + Gin + GORM）
1. **认证模块** `/api/auth`：注册、登录、JWT 刷新、修改密码
2. **OVH 账号模块** `/api/ovh-accounts`：多账号 CRUD（AppKey/Secret/Consumer 加密存储）
3. **服务器型号模块** `/api/catalog`：拉取并缓存 OVH 可购型号、规格、地区库存
4. **抢购任务模块** `/api/tasks`：创建/启用/暂停/删除抢购任务，配置型号、地区、数量、价格上限、重试策略
5. **抢购引擎**：后台 worker 池 + Redis 队列；按计划/即时触发；失败指数退避；并发抢购去重
6. **订单模块** `/api/orders`：抢购结果、订单状态、付款链接
7. **通知模块** `/api/notifications`：Telegram Bot Token、SMTP 配置；抢购成功/失败/库存出现推送
8. **日志模块** `/api/logs`：每次 OVH API 调用、抢购尝试的结构化日志
9. **统计模块** `/api/stats`：Dashboard 数据（成功率、订单总数、按渠道分布等）

### 前端页面
1. `/login`、`/register`
2. `/` Dashboard（Superset 风格：4 个 KPI 卡 + 趋势图 + 饼图 + 热力图 + 最近订单表）
3. `/tasks` 抢购任务列表 + 新建/编辑
4. `/catalog` OVH 型号浏览（按地区筛选、库存指示）
5. `/orders` 订单历史
6. `/logs` 实时日志（SSE/WebSocket）
7. `/accounts` OVH 账号管理
8. `/settings` 通知/账户设置

### 设计系统（Superset 风格）
- 主色：蓝 `oklch(0.62 0.19 255)`，背景白 + 浅灰侧边栏
- 字体：Inter（UI）+ JetBrains Mono（数据/日志）
- 组件：左侧图标导航 60px，顶部搜索栏，圆角卡片 + 细边框，中文化所有文案
- 图表：Recharts（折线、面积、柱状、热力、饼）

## 安全加固

- **密码**：bcrypt cost 12
- **JWT**：HS256 + 短期 access (15min) + refresh token；HttpOnly Cookie
- **OVH 凭证**：AES-256-GCM 加密存于 PG，密钥来自 `APP_ENCRYPTION_KEY` 环境变量
- **输入校验**：前端 zod + 后端 `go-playground/validator`
- **限流**：Gin 中间件 + Redis（登录 5 次/分钟，API 100 次/分钟/用户）
- **CORS**：白名单
- **SQL 注入**：GORM 参数化
- **审计日志**：所有敏感操作（账号增删、抢购触发）写入 audit 表
- **Docker**：非 root 用户运行；`.env` 不入仓；secrets 通过 env 注入
- **HTTPS**：Nginx + Let's Encrypt 示例配置

## Docker 一键部署

```yaml
# docker-compose.yml 服务
- postgres:15-alpine        (持久化 volume)
- redis:7-alpine
- backend (Go 多阶段构建)
- frontend (Nginx 静态服务 + 反代 /api 到 backend)
```

`make deploy` 或 `docker compose up -d` 启动。

## 分阶段交付

由于工作量极大，建议分 4 期，每期一次对话：

**第 1 期（本次）**：前端设计系统 + 登录/注册 + Dashboard 框架 + 后端骨架（main.go、Docker、PG/Redis 连接、auth 模块）+ docker-compose
**第 2 期**：OVH 账号管理 + 型号目录 + 后端 OVH 客户端
**第 3 期**：抢购任务引擎 + 调度 + 订单
**第 4 期**：通知系统 + 日志/审计 + 统计图表 + 文档

## 技术细节

- Go 1.23 + Gin + GORM + golang-jwt/jwt v5 + go-redis v9 + zap 日志
- 抢购引擎参考原项目 `coolci/OVH-BUY` 的下单流程：`POST /order/cart/{cartId}/eco` 等
- 前端：React 19 + TanStack Router + TanStack Query + Recharts + Tailwind v4 + shadcn/ui

## 需要你提供（后续阶段）

- Telegram Bot Token、SMTP 凭证（通过 Lovable 安全存储或 Docker env）
- 测试用 OVH AppKey/Secret/Consumer（仅本地测试）

---

**确认后我会执行第 1 期。** 如果你希望调整范围（例如砍掉某些模块、改用 SQLite、不要 Nginx 等），请直接告诉我。
