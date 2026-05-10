# App Folder Layout Round 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the remaining phone software screens out of `src/App.tsx` and into `src/apps/<app-name>/` folders without changing behavior.

**Architecture:** Keep the phone shell, global store, global styles, and utility libraries outside `src/apps/`. Move app-owned UI and tests into each app folder, with a small shared primitive module for repeated phone UI controls and a shared AI utility module for existing model request helpers.

**Tech Stack:** Vite, React, TypeScript, Zustand, `npx tsx` tests.

---

## File Structure

- `src/components/AppPrimitives.tsx`: shared `Header`, `Panel`, `Pill`, `Field`, `Row`, `Empty`, `EmptyScreen`, `Avatar`, and `CallButton`.
- `src/lib/aiClient.ts`: existing model list and chat completion request helpers.
- `src/apps/theater/`: small theater screen, logic, and tests.
- `src/apps/calendar/`: calendar screen.
- `src/apps/diary/`: diary and peek screens.
- `src/apps/memo/`: memo screen.
- `src/apps/browser/`: browser screen.
- `src/apps/qq/`: QQ chat list wrapper where possible.
- `src/apps/wechat/`: remaining WeChat shell, chat room, and bubble code where possible.
- `src/apps/appsStructure.test.ts`: verifies required app folders.

## Tasks

### Task 1: Shared Extraction

- [ ] Move repeated UI primitives from `src/App.tsx` to `src/components/AppPrimitives.tsx`.
- [ ] Move model request helpers from `src/App.tsx` to `src/lib/aiClient.ts`.
- [ ] Update imports without changing the function bodies.

### Task 2: Independent App Screens

- [ ] Move `TheaterScreen` and `theaterLogic` into `src/apps/theater/`.
- [ ] Move `CalendarScreen` into `src/apps/calendar/`.
- [ ] Move `DiaryScreen` and `PeekScreen` into `src/apps/diary/`.
- [ ] Move `MemoScreen` into `src/apps/memo/`.
- [ ] Move `BrowserScreen` into `src/apps/browser/`.

### Task 3: Chat App Screens

- [ ] Move remaining WeChat wrapper/chat code into `src/apps/wechat/`.
- [ ] Move QQ entry code into `src/apps/qq/` while preserving the existing shared chat behavior.
- [ ] Keep `src/App.tsx` as shell plus `FeatureScreen` routing.

### Task 4: Tests And Docs

- [ ] Extend `src/apps/appsStructure.test.ts` for every app folder split in this round.
- [ ] Update `PROJECT_OUTLINE.md`, affected `docs/*`, module READMEs, and `docs/work-log.md`.
- [ ] Run `npx tsx src/apps/appsStructure.test.ts`.
- [ ] Run all `src/**/*.test.ts`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Check for direct `randomUUID` calls.
- [ ] Commit and push the verified changes.
