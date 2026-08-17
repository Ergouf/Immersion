# Phase 05 Completion Checklist

## Format

- [ ] Backup 顶层 `format` 与 `backupVersion` 明确。
- [ ] backup version 与 DB schema version 分离。
- [ ] id/timestamp 保持稳定事实值。
- [ ] export 不包含缓存、设备路径或日志。

## Export

- [ ] Android 可生成 JSON 并调用系统分享。
- [ ] iOS 可生成 JSON 并调用系统分享。
- [ ] App 不自动上传任何云服务。

## Import

- [ ] 选择文件后先 validate，再允许写入。
- [ ] 对文件大小有合理上限。
- [ ] 未知未来 backupVersion 被拒绝。
- [ ] 导入前展示 counts/version。
- [ ] 本地缺失 id 被插入。
- [ ] 内容相同的已存在 id 被 skip。
- [ ] 同 id 不同内容导致整个 import 中止。
- [ ] import 在 transaction 中完成，失败全部 rollback。
- [ ] FK 关系在导入后完整。

## Migration

- [ ] Android → iOS 数据一致性验证通过。
- [ ] iOS → Android 数据一致性验证通过。
- [ ] 同一 backup 重复导入不会重复数据。
- [ ] 损坏、冲突、未来版本场景不会破坏现有数据。
- [ ] P02–P04 核心功能回归通过。
- [ ] MANIFEST exit gate 全部满足。
