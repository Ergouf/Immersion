# Phase 06 Tasks

## P06-T01 — Failure and lifecycle audit

- 建立 Android/iOS reliability matrix。
- 逐项复现后台、锁屏、kill/relaunch、invalid route、DB failure、backup failure。
- 修复必须优先保持数据，不使用删库重建作为通用恢复。

## P06-T02 — Critical pure-logic tests

- 为 duration、reflection validation、7-day summary、backup validator/serializer、import conflict/idempotency 增加自动化测试。
- 仅在确有需要时增加一个最小测试依赖，并记录原因。

**依赖：** P06-T01 可并行部分执行，但最终需共同通过 gate。

## P06-T03 — UI token consolidation

- 收口 spacing/typography/radius/color token。
- 删除重复 style magic numbers（合理例外需注释）。
- 支持系统 light/dark。
- 检查页面 primary/secondary action 层级。
- 删除不服务内容的动画和装饰。

## P06-T04 — Accessibility pass

- VoiceOver/TalkBack labels。
- touch target、font scaling、contrast、focus order。
- reduced motion。
- Android/iOS 真机分别验证关键流程。

**依赖：** P06-T03。

## P06-T05 — Build configuration

- 设置稳定 app identifiers。
- 添加最小 icon/splash。
- 配置 Expo/EAS 所需构建文件。
- 检查 manifest/Info.plist 最终权限，不申请未使用能力。

## P06-T06 — Dual-platform beta smoke test

在 Android 与 iOS 可安装 beta build 上分别完成：

1. cold start；
2. start session；
3. capture distraction；
4. lock/background/recover；
5. end + reflection；
6. history/detail/summary；
7. export；
8. import 到另一平台；
9. repeated import；
10. relaunch and data verification。

## P06-T07 — Scope and dependency audit

- 删除未使用 runtime dependencies。
- 检查没有 custom native code、backend、analytics、AI 等越界内容。
- README 与实际架构一致。
- 标记 v0.5 beta readiness。
