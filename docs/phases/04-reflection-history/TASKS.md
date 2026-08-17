# Phase 04 Tasks

## P04-T01 — Reflection domain and validation

- 为 immersion level、delay、end reason 建立稳定 domain 类型/枚举。
- 建立纯 TypeScript validation：level 0–3；delay 非负且不大于合理 session duration；end reason 仅允许已定义值。
- repository 提供更新 reflection 的单一入口。

## P04-T02 — Full review UI

- 在 Phase 02 minimal review 上增加三个极简问题。
- 所有字段均允许跳过。
- 保存中阻止重复提交。
- 保存失败保留当前选择并显示低干扰错误。
- 成功后返回首页。

**依赖：** P04-T01。

## P04-T03 — History query and list

- repository/query 提供最近 session 列表。
- 只默认显示已结束 session；active session 仍由 focus/recovery 流程管理。
- 建立 history route 和简单列表。
- 处理空状态和大量记录滚动性能，不引入复杂虚拟化库，优先 React Native 自带能力。

**依赖：** P04-T01。

## P04-T04 — Session detail

- 展示 session 时间、duration、reflection 与 distractions。
- end reason 由 stable value 映射为 UI 文案。
- 详情只读，不在本 Phase 引入编辑/删除系统。

**依赖：** P04-T03。

## P04-T05 — Seven-day summary

- 在 data/query 层实现滚动 7 天 summary：count、total duration、average duration。
- 非法/未结束 session 不进入 aggregate。
- 首页只展示这三个指标，不做图表。

**依赖：** P04-T03。

## P04-T06 — MVP regression and freeze

- 回归 P02/P03 全部关键场景。
- Android/iOS 验证 review、history、metrics。
- 检查没有引入 streak、图表、项目管理等 scope creep。
- 标记 v0.3 MVP，并开始真实使用期；新想法进入 backlog，不直接实现。
