# Phase 02 Completion Checklist

## Core loop

- [ ] 首页只需要输入单一活动即可开始。
- [ ] 空标题不能创建 session。
- [ ] 创建成功后才进入 focus 页面。
- [ ] focus 页面显示标题和 elapsed time。
- [ ] elapsed time 基于 `Date.now() - started_at`。
- [ ] 结束先写数据库，再导航 review。
- [ ] Review 退出不会导致 session 仍处于 active。

## Recovery

- [ ] 锁屏后时间正确。
- [ ] 后台后时间正确。
- [ ] 杀死 App 后可以恢复 active session。
- [ ] 同时最多一个 active session。
- [ ] 重复点击开始不会产生重复记录。
- [ ] 不合法 session route 不会崩溃。

## Scope

- [ ] 没有暂停/继续、番茄周期、通知。
- [ ] 没有 distraction UI。
- [ ] 没有历史、统计、反思问卷。
- [ ] 没有新增全局状态框架。

## Quality gate

- [ ] Android 主流程真实运行通过。
- [ ] iOS 主流程真实运行通过。
- [ ] typecheck/lint/Expo doctor 无阻塞问题。
- [ ] 本 Phase 结束版本已经可日常使用。
- [ ] MANIFEST exit gate 全部满足。
