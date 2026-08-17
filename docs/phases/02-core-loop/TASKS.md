# Phase 02 Tasks

## P02-T01 — Session application service

- 在 repository 之上建立极薄的 session use-case/service：start、getActive、end。
- start 前检查 active session；存在则返回/恢复该 session 而不是新建。
- service 不引用 React Native UI。

## P02-T02 — Home start flow

- 正式实现首页标题输入。
- trim 输入；空字符串不可开始。
- 保存成功后才导航。
- 防止重复点击造成并发创建。

**依赖：** P02-T01。

## P02-T03 — Focus route and timer

- 建立 focus route。
- 从持久层读取目标 session，不把 route param 当成事实源。
- elapsed = current time - startedAt。
- interval 只刷新显示。
- 处理 AppState 回前台重算。

**依赖：** P02-T02。

## P02-T04 — Active session recovery

- App 冷启动查询 active session。
- 有 active session 时提供直接恢复路径；不得静默丢弃。
- 确保最多一个 active session。
- 对旧/无效 route id 做安全回退。

**依赖：** P02-T03。

## P02-T05 — End and minimal review

- 结束操作先持久化 `ended_at`。
- 建立最小 review 页面，显示本次持续时间。
- Review 完成返回首页。
- 不提前实现 immersionLevel/delay/endReason 输入。

**依赖：** P02-T04。

## P02-T06 — Lifecycle validation

手工验证：正常使用、后台、锁屏、进程被杀、重复开始、快速结束、跨午夜。执行 static checks 并记录结果。

**依赖：** P02-T05。
