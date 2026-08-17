# Phase 01 — Cross-platform Foundation

## 目标

建立一个小而稳定的 Android/iOS 共用工程地基。此阶段不实现真正的沉浸业务流程，只解决：项目可运行、依赖可控、SQLite 可持久化、数据访问边界清晰、后续 Phase 不需要重写底层。

## 技术基线

- React Native + Expo，TypeScript strict mode。
- Expo Router 管理页面路由。
- `expo-sqlite` 提供本地持久化。
- 依赖版本不在规划文档中写死；实施时使用稳定 Expo SDK 兼容版本并提交 lockfile。
- 不 eject，不建立自定义 `android/`、`ios/` 原生实现，不写 Kotlin/Swift。

## 目录边界

建议最小结构：

```text
app/
  _layout.tsx
  index.tsx
src/
  domain/
    session.ts
    distraction.ts
  data/
    database.ts
    migrations.ts
    repositories/
  theme/
```

`app/` 只负责页面与路由；`domain/` 定义稳定业务类型；`data/` 负责 SQLite 与 repository。页面禁止直接执行 SQL。

## 初始数据模型

### sessions

- `id TEXT PRIMARY KEY`
- `title TEXT NOT NULL`
- `started_at INTEGER NOT NULL`
- `ended_at INTEGER NULL`
- `immersion_level INTEGER NULL`，最终值限定 0–3
- `immersion_delay_minutes INTEGER NULL`
- `end_reason TEXT NULL`
- `created_at INTEGER NOT NULL`
- `updated_at INTEGER NOT NULL`
- `schema_version INTEGER NOT NULL DEFAULT 1`

`ended_at IS NULL` 表示活动中的 session，为 Phase 02 的进程恢复提供事实来源。

### distractions

- `id TEXT PRIMARY KEY`
- `session_id TEXT NOT NULL`
- `text TEXT NOT NULL`
- `created_at INTEGER NOT NULL`
- 外键指向 `sessions(id)`，删除 session 时级联删除。

Phase 01 只建立表与 repository 能力，不暴露 distraction 产品 UI。

## Migration 规则

数据库必须有显式 schema version/migration 入口。禁止通过“如果报错就删库重建”处理升级。migration 应幂等地按版本前进，并在 transaction 中完成需要原子性的变更。

## Repository 边界

至少定义：

- `SessionRepository`
- `DistractionRepository`

Phase 01 只实现后续已确定会用到的最小 CRUD；不要提前建立通用 ORM、service locator、dependency injection framework。

## UI

首页仅需显示产品名和基础占位状态，用于证明路由、theme 和数据库初始化不会阻塞启动。不要提前设计正式首页。

## 验收

1. Android 与 iOS 使用同一代码路径启动。
2. TypeScript/typecheck 无错误。
3. SQLite 初始化与 migration 成功。
4. repository 可写入并读取 session；重启后数据仍存在。
5. UI 中不存在 raw SQL。
6. 未引入后端、账号、AI、状态管理框架或自定义原生代码。
