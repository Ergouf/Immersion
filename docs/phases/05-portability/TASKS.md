# Phase 05 Tasks

## P05-T01 — Backup domain format

- 定义 `ImmersionBackupV1` TypeScript 类型。
- 明确 `format`、`backupVersion`、`databaseSchemaVersion`。
- 建立 serializer，确保 timestamp/id 原样保留。

## P05-T02 — Validator

- 建立纯 TypeScript structural + semantic validation。
- 验证 session 字段、reflection enum/range、distraction FK、重复 id、timestamp 合理性。
- 对未知未来 backupVersion fail closed。
- 设定并实现合理文件大小上限。

**依赖：** P05-T01。

## P05-T03 — Export service

- 从 repository 获取一致数据快照。
- 生成 V1 JSON。
- 使用 Expo SDK 兼容 file/share API 写文件并调用系统分享。
- 不增加自动云上传。

**依赖：** P05-T01。

## P05-T04 — Import preview

- 使用 Expo-compatible document picker 选择 JSON。
- 读取前检查文件类型/大小能检查的部分。
- 完整验证后展示 backupVersion、session count、distraction count。
- 未通过验证时不得启用 import。

**依赖：** P05-T02。

## P05-T05 — Transactional merge import

- 预检查本地 id conflicts。
- 相同记录 skip；不同内容同 id 则 abort。
- transaction 中按 sessions → distractions 顺序写入。
- 失败全部 rollback。
- 返回 inserted/skipped 结果。

**依赖：** P05-T04。

## P05-T06 — Cross-device migration test

至少验证：

- Android export → iOS import；
- iOS export → Android import；
- 同一 backup 重复导入不重复创建；
- 损坏 JSON；
- 未知 backupVersion；
- conflict；
- distractions 引用不存在 session；
- import 中途失败 rollback。
