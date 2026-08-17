# Phase 04 — Reflection, History, Minimal Metrics

## 目标

完成真正的 MVP：用户不仅能沉浸和暂存分心，还能在结束后做极简反思，并从历史记录中观察自己的沉浸模式。

本 Phase 结束后进入**功能冻结**。先真实使用，再决定是否值得开发任何新功能。

## Review

Session 在 Phase 02 已经先写入 `ended_at`，所以 Review 只负责补充反思字段，不能成为保存 session 的前置条件。

### 1. 沉浸程度

四档固定值：

- `0` — 完全没有
- `1` — 偶尔进入
- `2` — 明显沉浸
- `3` — 深度沉浸

允许跳过，数据库保持 `NULL`。产品不应用“必须打分”制造额外负担。

### 2. 大约多久进入状态

`immersion_delay_minutes`：可选、非负整数。若用户认为本次没有进入状态，可以留空。输入值不得明显超过 session 总时长。

### 3. 为什么结束

`end_reason` 使用稳定枚举值，展示层负责中文文案：

- `completed`
- `time_reached`
- `external_interruption`
- `voluntary_switch`
- `fatigue`
- `other`

允许不选。

Review 保存应是一次显式 update；失败时保留用户已选内容，不假装成功。

## History

建立简单历史页，以最近优先显示已结束 session：

- 日期/时间；
- title；
- duration；
- immersion level（若有）。

点击记录进入 detail：

- started/ended time；
- duration；
- immersion level；
- immersion delay；
- end reason；
- 本 session 暂存的 distraction 数量及内容。

历史页不是日记系统，不增加搜索、标签、项目、分类。

## 首页最小指标

仅显示滚动最近 7 天：

- 已结束 session 数；
- 总沉浸分钟；
- 平均 session 时长。

若数据不足，显示真实的 0/空状态，不构造激励文案。

## 指标计算原则

- duration = `ended_at - started_at`，只统计合法已结束 session。
- 负时长/损坏记录不得参与 aggregate；应被数据层过滤并可记录开发态警告。
- 7 天窗口用时间戳计算，展示按设备 locale 格式化。
- 聚合逻辑放在 repository/query/domain 层，不在 React component 中散落计算。

## 不做

- 图表、热力图、排行榜。
- streak/连续签到。
- 成就、积分、目标完成率。
- AI 总结。
- Todo/项目管理。
- 云同步。

## MVP 成功观察指标

产品层面优先观察三个变化，而不是追求打开 App 的次数：

1. 单次 session 持续时间是否逐渐增加；
2. 自报进入沉浸所需时间是否逐渐下降；
3. 每次 session 暂存的分心冲动数量是否变化。

这些只是个人观察指标，不在 MVP 中宣称医疗或因果效果。
