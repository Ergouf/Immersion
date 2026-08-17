# Phase 04 Completion Checklist

## Review

- [ ] immersion level 仅允许 0–3 或 NULL。
- [ ] immersion delay 可跳过且有合理范围校验。
- [ ] end reason 只存稳定枚举值或 NULL。
- [ ] Review 关闭/失败不会让已结束 session 重新变成 active。
- [ ] 保存失败不会丢失当前用户选择。

## History

- [ ] 最近 session 按时间正确排序。
- [ ] 历史空状态清晰且安静。
- [ ] detail 展示正确的 duration/reflection/distractions。
- [ ] active session 不被当成已完成历史记录。
- [ ] 没有搜索、标签、项目、Todo 等额外系统。

## Metrics

- [ ] 首页只有最近 7 天 session 数、总分钟、平均时长。
- [ ] duration 由 ended_at - started_at 计算。
- [ ] 未结束或损坏记录不参与 aggregate。
- [ ] 没有图表、streak、积分、排行榜。

## Cross-platform and regression

- [ ] Android review/history/summary 真实验证通过。
- [ ] iOS review/history/summary 真实验证通过。
- [ ] P02 核心闭环回归通过。
- [ ] P03 distraction capture 回归通过。
- [ ] typecheck/lint/Expo doctor 无阻塞问题。

## MVP freeze

- [ ] v0.3 已达到完整 MVP 定义。
- [ ] 新产品功能停止进入 active scope，先进入真实使用期/backlog。
- [ ] MANIFEST exit gate 全部满足。
