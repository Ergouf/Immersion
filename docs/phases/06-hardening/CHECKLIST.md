# Phase 06 Completion Checklist

## Reliability

- [ ] active session 后台/锁屏恢复正确。
- [ ] kill/relaunch 恢复正确。
- [ ] 跨午夜不会破坏 duration。
- [ ] invalid route 不崩溃。
- [ ] DB/backup 错误优先保留数据，不自动删库。
- [ ] duplicate taps 不破坏数据 invariant。

## Automated checks

- [ ] duration 关键测试通过。
- [ ] reflection validation 测试通过。
- [ ] 7-day aggregate 测试通过。
- [ ] backup validation/serialization 测试通过。
- [ ] import conflict/idempotency 测试通过。
- [ ] typecheck/lint/Expo doctor 通过。

## UI and accessibility

- [ ] 样式 token 已收口，无明显重复 magic values。
- [ ] light/dark 行为稳定。
- [ ] 无不服务内容的渐变、粒子、奖励动画。
- [ ] reduced motion 被尊重。
- [ ] VoiceOver 关键流程可理解。
- [ ] TalkBack 关键流程可理解。
- [ ] 字体缩放、touch targets、safe area、keyboard 验证通过。

## Build

- [ ] app identifiers 已稳定配置。
- [ ] Android beta build 可安装。
- [ ] iOS beta build 可安装。
- [ ] Android 真机完整 smoke test 通过。
- [ ] iOS 真机完整 smoke test 通过。
- [ ] 无无理由的敏感权限请求。

## Scope

- [ ] 没有在 hardening 阶段增加新产品功能。
- [ ] 没有 backend/accounts/cloud sync/AI/app blocking/gamification/analytics。
- [ ] 未使用依赖已删除。
- [ ] P01–P05 回归通过。
- [ ] MANIFEST exit gate 全部满足。
