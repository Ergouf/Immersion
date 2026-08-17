# Phase 05 — Data Portability

## 目标

解决未来从 Android 换到 iPhone（或反向）的数据迁移问题，不引入账号、服务器或云同步。

用户拥有数据；App 提供一个可验证、版本化、可导出和导入的本地备份文件。

## Backup 格式

建议 JSON 顶层结构：

```json
{
  "format": "immersion-backup",
  "backupVersion": 1,
  "exportedAt": 0,
  "databaseSchemaVersion": 1,
  "sessions": [],
  "distractions": []
}
```

### 规则

- `format` 必须精确匹配。
- `backupVersion` 独立于数据库 schema version，未来可单独迁移。
- timestamp 保持 epoch milliseconds，不导出 locale 格式化字符串作为事实值。
- 保留原始 id 和 session/distraction 关系。
- 导出只包含产品业务数据，不包含设备路径、缓存、日志或敏感系统信息。

## Export

使用当前 Expo SDK 兼容的官方文件/分享能力：

1. 从 repository 读取一致的数据快照；
2. 生成 JSON；
3. 写入临时/文档文件；
4. 调用系统 share sheet，让用户自行存到 Files、网盘或发送给自己。

不自动上传任何第三方服务。

建议文件名：`immersion-backup-YYYY-MM-DD.json`。

## Import

通过 Expo 兼容 document picker 选择 JSON 文件。

### Import pipeline

`pick → read → parse → structural validate → semantic validate → preview → transaction import → report`

在任何写数据库操作之前必须完成验证。

### 默认合并策略

- 保留导入文件中的原始 id。
- 本地不存在的 id：插入。
- id 已存在且内容相同：跳过并计数。
- id 已存在但内容不同：视为 conflict，**默认中止整个 import**，不覆盖本地数据。
- sessions 先导入，distractions 后导入。
- import 必须在 transaction 中完成；失败回滚，不能留下半份数据。

这是一个迁移工具，不做复杂同步/冲突解决 UI。

## Import preview/result

写入前至少告诉用户：

- backup 版本；
- session 数量；
- distraction 数量；
- 是否通过验证。

完成后报告：inserted / skipped。发生 conflict 或损坏时明确失败原因，不自动修复未知格式。

## 安全边界

- 限制可接受文件大小到合理范围，避免意外读取超大文件。
- 不执行文件内容。
- 所有 unknown enum/value 必须按版本策略处理，不能静默变成当前值。
- 无法理解的未来 backupVersion 应拒绝导入并提示需要更新 App。

## 验收主场景

Android 导出 → 将 JSON 传到 iPhone → iPhone 导入 → sessions、reflection、distractions 数量和关联一致。
