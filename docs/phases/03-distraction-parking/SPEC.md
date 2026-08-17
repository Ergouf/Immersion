# Phase 03 — Distraction Parking

## 目标

加入 MVP 的核心差异机制：当沉浸过程中出现“我想去做别的事”的冲动时，用极低成本记录它，然后立即回到原任务。

产品机制是 **park, not pursue**。记录不是 Todo 系统，也不是第二个收件箱。

## Focus 页面变化

在现有 focus 页面增加一个次级动作：

`记录一个念头`

它的视觉权重必须低于 session title、timer 和结束动作；不可做成高刺激悬浮动画。

## Capture 交互

建议使用简单 modal/bottom sheet（优先平台兼容且依赖最少的实现）：

1. 点击 `记录一个念头`；
2. 输入一句自由文本；
3. 点击 `暂存` 或键盘提交；
4. 写入成功后立即关闭并回到 focus。

目标是几秒内完成，不引导用户继续整理。

## 数据

写入 `distractions`：

- UUID/string id；
- 当前 active `session_id`；
- trim 后的非空 text；
- `created_at = Date.now()`。

空文本不保存。记录失败应保留输入并给出安静的 inline 错误，不得关闭后造成内容丢失。

## 并发与生命周期

- 只允许向当前 active session 新增 distraction。
- session 已结束时提交 capture，应拒绝写入并安全返回 review/home。
- modal 打开后 App 进后台再回来，不能误提交或清空用户未提交文本。

## 明确禁止

- 标签、分类、优先级、截止日期。
- 自动转 Todo。
- distraction 列表在 focus 页面持续吸引注意。
- 对 distraction 做 AI 分析。
- 任何奖励、惩罚、分数。

## 验收

一次完整交互应是：点击 → 输入 → 暂存 → 回到原 timer。保存记录与 session 正确关联，杀死/重启后仍存在。
