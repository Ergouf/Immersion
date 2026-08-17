# Phase 01 Completion Checklist

## Scope

- [ ] 只完成工程地基与数据边界，没有实现 Phase 02+ 产品功能。
- [ ] 没有后端、账号、AI、云同步、应用屏蔽、通知或社交功能。
- [ ] 没有自定义 Kotlin/Swift。

## Architecture

- [ ] React Native + Expo + TypeScript 工程可运行。
- [ ] Expo Router 已配置。
- [ ] `expo-sqlite` 是唯一正式业务持久化层。
- [ ] UI 不直接执行 SQL。
- [ ] repository 层与 domain 类型已建立。
- [ ] migration 有显式版本机制且重复启动安全。
- [ ] foreign keys 已启用。

## Data

- [ ] `sessions` schema 与 SPEC 一致。
- [ ] `distractions` schema 与 SPEC 一致。
- [ ] session 可写入、读取并跨 App 重启保持。
- [ ] timestamp 使用 epoch milliseconds。

## Quality gate

- [ ] TypeScript/typecheck 通过。
- [ ] lint 通过。
- [ ] Expo doctor 无阻塞性问题。
- [ ] Android 启动验证通过。
- [ ] iOS 启动验证通过，或有明确的可复现环境阻塞且代码无平台专属依赖；进入 P02 前必须补齐真实 iOS 验证。
- [ ] `MANIFEST.yaml` 的全部 exit gate 满足。
