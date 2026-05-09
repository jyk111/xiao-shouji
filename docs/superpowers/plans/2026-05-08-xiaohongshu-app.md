# Xiaohongshu App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Xiaohongshu app folder and wire the desktop icon to read/write Xiaohongshu-only notes.

**Architecture:** Keep Xiaohongshu UI in `src/xiaohongshu/`, persist notes in `src/store.ts`, and let `src/App.tsx` only import and route to the new app. Shared note filtering and summaries live in a small logic file so tests and future AI context can reuse it.

**Tech Stack:** React 19, TypeScript, Zustand, existing Vite app shell.

---

### Task 1: Data Model And Logic

**Files:**
- Create: `src/xiaohongshu/types.ts`
- Create: `src/xiaohongshu/xiaohongshuLogic.ts`
- Test: `src/xiaohongshu.test.ts`

- [ ] Add a failing test for sorting, tag filtering, and AI-readable summaries.
- [ ] Implement `XiaohongshuNote`, `getSortedXiaohongshuNotes`, `filterXiaohongshuNotes`, and `buildXiaohongshuContext`.
- [ ] Run `npx tsx src/xiaohongshu.test.ts`.

### Task 2: Store Integration

**Files:**
- Modify: `src/store.ts`

- [ ] Add `xiaohongshuNotes` to persisted state.
- [ ] Add `addXiaohongshuNote`, `updateXiaohongshuNote`, `deleteXiaohongshuNote`, and `toggleXiaohongshuFavorite`.
- [ ] Bump persist version and migrate old state to `xiaohongshuNotes: []`.

### Task 3: App UI And Routing

**Files:**
- Create: `src/xiaohongshu/XiaohongshuApp.tsx`
- Modify: `src/App.tsx`

- [ ] Render a standalone feed, note composer, detail view, tag filter, favorite toggle, and delete action.
- [ ] Route `screen === 'xiaohongshu'` to `XiaohongshuApp`.
- [ ] Update the Xiaohongshu placeholder copy so the real app owns the entry.

### Task 4: Documentation And Verification

**Files:**
- Create: `模块/小红书/README.md`
- Modify: `PROJECT_OUTLINE.md`

- [ ] Document the new folder and state fields.
- [ ] Run `npx tsx src/xiaohongshu.test.ts`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
