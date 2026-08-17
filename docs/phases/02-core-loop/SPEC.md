# Phase 02 — First Usable Immersion Loop

## 目标

交付第一个真正可以每天使用的版本：**输入一件事 → 开始 → 持续计时 → 结束 → 保存**。从本 Phase 结束开始，不允许主流程长期处于“开发中不可用”的状态。

## 用户流程

### 首页

- 一个标题输入框：`今天想沉浸于什么？`
- 一个主要动作：`开始沉浸`。
- 空标题不能开始；仅做轻量 inline 提示，不弹复杂对话框。

### 开始

点击开始时：

1. 生成 session id。
2. 记录 `started_at = Date.now()`。
3. `ended_at = null`。
4. 先持久化成功，再进入 focus 页面。

禁止仅把活动 session 放在 React 内存状态中。

### Focus 页面

仅展示：

- session title；
- elapsed time；
- `结束沉浸`。

计时真值必须是 `Date.now() - started_at`。可以用 interval 触发 UI 重绘，但 interval 不能作为累计时间的数据源。

### 后台/锁屏/重启

- App 回前台时重新根据 `started_at` 计算时间。
- App 被系统杀死后重新打开，应查询 `ended_at IS NULL` 的 active session。
- 存在 active session 时首页不能悄悄新建第二个；应恢复现有 session。

### 结束与 Review 过渡

点击结束：

1. 写入 `ended_at = Date.now()`；
2. 导航到 review route；
3. Phase 02 的 review 页面可以只是“本次 X 分钟 / 完成”最小页面，不收集 Phase 04 的反思字段。

即使用户在 review 页面直接退出，session 也已经安全结束并持久化。

## 状态规则

同一时刻最多允许一个 active session。该规则应由 repository/service 边界保证，而不只依赖按钮 disabled。

## 不做

- 不做暂停/继续。
- 不做倒计时、番茄钟周期。
- 不做通知。
- 不做 distraction UI。
- 不做历史列表、图表、连续签到。

## 验收场景

1. 开始 10 分钟，锁屏 20 分钟，回来显示约 30 分钟。
2. 开始后杀死 App，再打开可恢复同一 session。
3. 连续点击开始不会创建两个 active sessions。
4. 结束后重启，session 的 started/ended 时间完整。
5. Phase 02 完成后 App 已具备日常可用的最小闭环。
