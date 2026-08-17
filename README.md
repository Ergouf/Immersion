# Immersion

A small, local-first, cross-platform app for rebuilding the ability to remain deeply engaged with one thing.

## Product thesis

Immersion is not a generic productivity suite or another feature-heavy Pomodoro timer. The MVP tests a narrower hypothesis: a low-stimulation tool can help a person enter, maintain, and observe deep immersion by reducing task switching and by parking distracting impulses instead of immediately acting on them.

## MVP principles

- **Cross-platform from day one:** Android and iOS share the same React Native/Expo codebase.
- **Local-first:** no account, backend, cloud sync, ads, social feed, or telemetry in the MVP.
- **Quiet interface:** the app should demand less attention than the activity it supports.
- **One-task flow:** start one immersion session, park distractions, end, reflect.
- **Data ownership:** data is stored locally and can later be exported/imported between phones.
- **Small architecture:** prefer Expo-supported libraries and platform-neutral TypeScript over custom native code.
- **Evidence before expansion:** AI, app blocking, gamification, social features, and cloud services remain out of scope until real usage justifies them.

## Planned stack

- React Native + Expo
- TypeScript
- Expo Router
- `expo-sqlite`
- Expo-supported file/share/document APIs when backup is introduced

Exact package versions are selected and locked during Phase 1 using versions compatible with the chosen stable Expo SDK.

## Delivery phases

| Phase | Outcome | Version target |
|---|---|---|
| 01 | Cross-platform foundation and persistence boundary | v0.0.1 |
| 02 | First usable immersion loop | v0.1 |
| 03 | Distraction parking | v0.2 |
| 04 | Reflection, history, and minimal metrics | v0.3 MVP |
| 05 | Export/import for device migration | v0.4 |
| 06 | Reliability, accessibility, UI polish, Android/iOS release readiness | v0.5 beta |

Each phase lives under `docs/phases/` and contains:

- `SPEC.md` — behavior, architecture, scope, acceptance criteria.
- `TASKS.md` — implementation tasks with explicit IDs and dependencies.
- `CHECKLIST.md` — human/agent verification before closing the phase.
- `MANIFEST.yaml` — machine-readable constraints: dependencies, allowed and forbidden changes, deliverables, acceptance gates, and exit conditions.

`PHASES.yaml` is the project-level constraint file. A later phase must not begin until the previous phase's exit gate is satisfied.

## Hard MVP boundary

Phases 01–04 may only add capabilities that directly support **entering, maintaining, or observing immersion**. Phase 05 adds data portability. Phase 06 stabilizes what already exists. Any unrelated feature goes to backlog rather than into the active phase.
