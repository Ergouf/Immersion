# Phase 06 — Hardening and Dual-platform Beta

## 目标

不增加新的产品能力，只把 P01–P05 已存在的功能做稳定、可恢复、可访问、低刺激，并完成 Android/iOS 双平台 beta readiness。

本阶段的基本纪律：**fix and simplify, do not expand**。

## 1. Reliability matrix

系统性验证并修复：

- App 在 active session 中进入后台/锁屏；
- OS 杀进程后恢复；
- 跨午夜/日期变化；
- 设备时钟发生合理变化时 UI 不崩溃；
- 快速重复 tap；
- route id 无效；
- 数据库 migration 异常；
- backup 损坏/冲突/重复导入；
- keyboard、safe area、不同屏幕尺寸；
- 低内存/冷启动下的 loading 状态。

对无法自动恢复的数据问题，应安全失败并保留原数据，而不是删库重置。

## 2. Active session recovery UX

冷启动发现 active session 时，应有单一明确恢复路径。若数据本身不完整导致无法恢复，显示可理解错误并提供不会破坏历史数据的安全处理方案。

不得为了“看起来正常”自动把未知状态 session 标记完成或删除。

## 3. Low-stimulation design system

收口少量 token：

- spacing；
- typography；
- radius；
- background/surface/text/secondary/accent；
- light/dark（优先跟随系统）。

原则：

- 无渐变、粒子、炫技动画；
- 动画仅用于状态连续性，且尊重 reduced motion；
- 主页面层级少、单一 primary action；
- 图标能不用则不用；
- 不用视觉奖励诱导频繁打开 App。

## 4. Accessibility

- 交互目标满足移动端合理点击面积；
- 文本支持系统字体缩放到合理范围；
- VoiceOver/TalkBack 对关键按钮、timer、input 有可理解 label；
- 颜色不是唯一状态表达；
- focus 顺序合理；
- 支持 reduced motion。

## 5. Test strategy

此阶段补齐最值得自动化的稳定纯逻辑测试，优先：

- duration 计算；
- reflection validation；
- 7-day aggregate；
- backup validation/serialization；
- import conflict/idempotency；
- repository 中关键 invariant。

若需要新增 test dependency，只选择一个与 Expo/React Native 当前版本兼容的最小方案，并在 manifest/update 中记录理由。不要为了覆盖率引入复杂测试平台。

## 6. Release readiness

- 完成 app name、bundle/package identifier 的正式配置。
- 准备最小 icon/splash，仅服务识别，不做品牌工程。
- 配置 EAS build（如采用）。
- Android/iOS 各生成可安装 beta build。
- 真机走完整 smoke test。
- 检查权限：MVP 不应无理由申请通知、定位、通讯录、相机、麦克风等权限。

App Store/Play Store 正式上架文案、营销站点、付费系统不属于本 Phase，除非另立后续计划。

## Exit 标准

P06 完成意味着 v0.5 beta：核心功能稳定、数据可迁移、Android/iOS 可安装验证，且产品仍保持小而美，没有因为“收尾”偷偷扩张功能。
