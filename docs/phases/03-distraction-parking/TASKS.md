# Phase 03 Tasks

## P03-T01 — Distraction repository completion

- 补齐 `addForActiveSession` / `listBySession` 等当前 Phase 必需能力。
- 写入前验证目标 session 仍 active。
- 保持 SQL 在 data 层。

## P03-T02 — Capture component

- 建立最小输入 modal/sheet。
- 自动聚焦输入时注意 Android/iOS 键盘差异。
- trim；空值不保存。
- 保存中避免重复提交。
- 保存失败保留文本。

**依赖：** P03-T01。

## P03-T03 — Focus integration

- 在 focus 页面增加低视觉权重入口。
- 打开 capture 不暂停 timer。
- 保存后立即回 focus，timer 继续基于 wall clock 显示。
- 不在 focus 主界面渲染 distraction 内容列表。

**依赖：** P03-T02。

## P03-T04 — Lifecycle/edge cases

验证 modal 打开时后台/前台、session 在另一状态结束、连续快速提交、超长文本、emoji/中文/英文输入、数据库写入失败。

**依赖：** P03-T03。

## P03-T05 — Regression

重新跑 Phase 02 的 start/recovery/end 核心场景，确认 distraction 功能没有改变 session 计时与单 active invariant。
