# Phase 01 Tasks

任务按顺序执行；每个提交应能关联到 task id。

## P01-T01 — Scaffold

- 使用 Expo + TypeScript 创建项目。
- 配置 Expo Router。
- 开启/保留严格 TypeScript 检查。
- 提交 package lockfile。
- 添加 `typecheck`、`lint`、`expo-doctor` 等可重复执行脚本；不为了脚本额外引入大型工具。

**完成定义：** Android/iOS 入口来自同一项目，开发服务器可正常启动。

## P01-T02 — Minimal project boundaries

- 建立 `app/`、`src/domain/`、`src/data/`、`src/theme/`。
- 建立 `Session`、`Distraction` TypeScript domain types。
- 不建立暂时不用的 manager/provider/utility 层。

**依赖：** P01-T01。

## P01-T03 — SQLite bootstrap and migration runner

- 安装 `expo-sqlite` 的 SDK 兼容版本。
- 建立数据库初始化函数。
- 开启 foreign keys。
- 建立 versioned migration runner。
- 创建 `sessions` 与 `distractions` 表及必要索引。

**依赖：** P01-T02。

## P01-T04 — Repository layer

- 定义最小 `SessionRepository`、`DistractionRepository` 接口。
- 建立 SQLite 实现。
- SQL 仅存在于 data/repository/migration 层。
- 数据行到 domain object 的映射集中处理。

**依赖：** P01-T03。

## P01-T05 — Persistence smoke path

- 用开发态 smoke action 或临时开发脚本验证 create/read/restart/read。
- 验证 foreign key 与 timestamp 类型。
- 测试 migration 重复初始化不会破坏已有数据。
- 验证完成后不要把测试按钮留在正式产品 UI。

**依赖：** P01-T04。

## P01-T06 — Cross-platform baseline validation

- Android 启动检查。
- iOS simulator/device 可用时执行启动检查；没有 iOS 环境时至少确保无 platform-specific import，并将真机/模拟器验证保留为 exit gate。
- 执行 typecheck、lint、Expo doctor。
- 更新 Phase checklist。

**依赖：** P01-T05。
