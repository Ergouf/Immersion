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

## Local development

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run doctor
npm start
```

The Android and iOS targets share the same `app/` and `src/` code paths. The native bundle smoke commands used in the phase gates are:

```bash
npx expo export --platform android --output-dir dist-native
npx expo export --platform ios --output-dir dist-ios
```

Installable beta builds use the profiles in `eas.json` and require a configured Expo account plus a real Android/iOS device for the final smoke matrix.

## GitHub automation

### Continuous validation and main APK

`.github/workflows/release-artifacts.yml` runs for pushes to `main` and `agent/**`, pull requests targeting `main`, and manual dispatches.

Every run performs:

- deterministic dependency install with `npm ci`;
- typecheck and automated tests;
- lint;
- Expo Doctor;
- Android and iOS Expo bundle exports;
- short-lived Actions artifact upload for the exported bundles.

For a direct push to `main` or a manual workflow dispatch, it additionally:

1. generates the Android native project with Expo prebuild;
2. loads the Android signing identity from repository Secrets;
3. builds a signed release APK;
4. verifies the APK signature with `apksigner`;
5. renames the APK with the package version and short commit SHA;
6. generates a matching SHA-256 checksum;
7. uploads the APK and checksum as a 30-day Actions artifact named `immersion-signed-apk-<commit>`.

Pull requests and non-main development branches do not receive signing Secrets and therefore do not build the signed APK.

### Tag-driven Release

`.github/workflows/release.yml` turns a version tag into the durable GitHub Release. Pushing a `v*` tag starts the release pipeline.

Before publishing, the workflow requires the tag version to match `package.json` exactly. For example, package version `0.5.1` must be released with tag `v0.5.1`.

The release pipeline then:

1. installs locked dependencies;
2. runs tests, typecheck, lint, and Expo Doctor;
3. validates both Android and iOS Expo exports;
4. generates the Android native project with Expo prebuild;
5. builds the Android release APK using the repository signing key;
6. verifies the APK signature with `apksigner`;
7. renames the asset to `Immersion-<tag>-android.apk`;
8. generates a matching SHA-256 checksum file;
9. creates or updates the GitHub Release and uploads both files.

`v0.*` versions and tags containing a prerelease suffix are marked as GitHub pre-releases. The Linux workflow validates the iOS bundle but does not produce an installable IPA; iOS distribution remains an EAS/macOS signing task.

Required repository Secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Keep the matching Android signing keystore backed up outside GitHub. Future Android updates must continue to use the same signing identity.

Typical release sequence:

```bash
# package.json and package-lock.json should already contain the new version
git tag v0.5.1
git push origin v0.5.1
```

If validation or signing fails, the Release is not newly published. Re-running the same tag workflow is safe: existing Release assets are replaced idempotently.

For an older tag created before the current release workflow existed, open **Actions → Release → Run workflow** and enter the existing tag, such as `v0.5.0`. The workflow checks out that exact tag, rebuilds it, and backfills or replaces its APK and SHA-256 assets without moving the tag.

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

## Current implementation record

The implementation is organized by the six manifests under `docs/phases/`. Domain and repository logic is covered by `tests/domain.test.ts`; the current verification record, including platform limits of this Windows workspace, is in `docs/verification/phase-status.md`.
