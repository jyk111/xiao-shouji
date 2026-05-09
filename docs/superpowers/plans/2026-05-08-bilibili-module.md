# Bilibili Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independent B站 app folder that reads and displays only B站 video entries inside the small phone.

**Architecture:** Add a focused `src/bilibili/` module for B站 types, fallback generation, model JSON parsing, and React UI. Keep global persistence in `src/store.ts`; keep `src/App.tsx` as the screen router only.

**Tech Stack:** React 19, TypeScript, Zustand persist, Node assert tests run with `tsx`, existing Vite/Tailwind styling.

---

## File Structure

- Create `src/bilibili/bilibiliTypes.ts`: exports `BilibiliVideoEntry`, `BilibiliComment`, and `BilibiliSearchRecord`.
- Create `src/bilibili/bilibiliLogic.ts`: owns fallback entries, JSON parsing, B站 URL filtering, and search payload generation.
- Create `src/bilibili/bilibiliLogic.test.ts`: Node assert tests for B站-only behavior.
- Create `src/bilibili/BilibiliScreen.tsx`: renders feed, search results, detail view, favorite, and watched state.
- Modify `src/store.ts`: adds B站 state/actions and persist migration.
- Modify `src/App.tsx`: imports `BilibiliScreen` and routes `screen === 'bilibili'` to it.
- Modify `PROJECT_OUTLINE.md`: registers the new module folder and entry point.

## Task 1: B站 Logic Module

**Files:**
- Create: `src/bilibili/bilibiliTypes.ts`
- Create: `src/bilibili/bilibiliLogic.ts`
- Test: `src/bilibili/bilibiliLogic.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import assert from 'node:assert/strict';
import { buildFallbackBilibiliPayload, normalizeBilibiliEntries, parseBilibiliPayload } from './bilibiliLogic.ts';

const fallback = buildFallbackBilibiliPayload('雨夜便利店', 1710000000000);
assert.equal(fallback.entries.length, 4);
assert.equal(fallback.entries.every((entry) => entry.url.includes('bilibili.com') || entry.url.startsWith('phone://bilibili/')), true);
assert.equal(fallback.entries[0].title.includes('雨夜便利店'), true);

const parsed = parseBilibiliPayload(JSON.stringify({
  summary: '只刷到 B站相关视频。',
  entries: [
    { title: 'B站视频', upName: '生活区UP', url: 'https://www.bilibili.com/video/BV1xx411c7mD', description: '简介', tags: ['生活'], playCount: '1.2万', danmakuCount: '233', danmaku: ['来了'], comments: [{ userName: '观众', content: '像真的', likedCount: '12' }] },
    { title: '别的平台', upName: '外站', url: 'https://www.zhihu.com/question/1', description: '简介', tags: ['外站'], playCount: '0', danmakuCount: '0', danmaku: [], comments: [] },
  ],
}), '雨夜便利店', 1710000000000);

assert.equal(parsed.entries.length, 1);
assert.equal(parsed.entries[0].url.includes('bilibili.com'), true);
assert.equal(parsed.entries[0].comments[0].createdAt, 1710000000000);

const normalized = normalizeBilibiliEntries([
  { title: '  标题  ', upName: '', url: 'not a url', description: '', tags: ['  日常  ', ''], playCount: '', danmakuCount: '', danmaku: ['  第一  '], comments: [] },
], '关键词', 1710000000000);

assert.equal(normalized[0].title, '标题');
assert.equal(normalized[0].upName, '匿名UP');
assert.equal(normalized[0].url.startsWith('phone://bilibili/'), true);
assert.deepEqual(normalized[0].tags, ['日常']);

console.log('bilibili logic tests passed');
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npx tsx src/bilibili/bilibiliLogic.test.ts`

Expected: FAIL because `src/bilibili/bilibiliLogic.ts` does not exist yet.

- [ ] **Step 3: Implement minimal logic**

Create the types and logic shown by the test API. `normalizeBilibiliEntries` trims fields, filters external URLs, fills defaults, and creates ids. `parseBilibiliPayload` parses JSON and falls back to generated entries when parsing or filtering fails.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npx tsx src/bilibili/bilibiliLogic.test.ts`

Expected: PASS and prints `bilibili logic tests passed`.

## Task 2: Store State And Actions

**Files:**
- Modify: `src/store.ts`
- Test: `src/bilibili/bilibiliStore.test.ts`

- [ ] **Step 1: Write failing store tests**

```ts
import { strict as assert } from 'node:assert';
import { useAppStore } from '../store';

useAppStore.setState({ bilibiliEntries: [], bilibiliSearches: [] } as Partial<ReturnType<typeof useAppStore.getState>>);

const id = useAppStore.getState().addBilibiliEntries([
  {
    title: '雨夜便利店切片',
    upName: '生活区UP',
    cover: '',
    url: 'https://www.bilibili.com/video/BV1xx411c7mD',
    description: '一条像生活记录的视频。',
    tags: ['生活'],
    playCount: '2.3万',
    danmakuCount: '321',
    comments: [],
    danmaku: ['来了'],
    createdAt: 1710000000000,
    source: 'generated',
  },
])[0];

assert.equal(useAppStore.getState().bilibiliEntries.length, 1);
useAppStore.getState().toggleBilibiliFavorite(id);
assert.equal(useAppStore.getState().bilibiliEntries[0].favorite, true);
useAppStore.getState().markBilibiliWatched(id, 1710000005000);
assert.equal(useAppStore.getState().bilibiliEntries[0].watchedAt, 1710000005000);

const searchId = useAppStore.getState().addBilibiliSearch({ query: '雨夜', summary: '搜索摘要', entryIds: [id], source: 'generated' });
assert.equal(useAppStore.getState().bilibiliSearches[0].id, searchId);
assert.deepEqual(useAppStore.getState().bilibiliSearches[0].entryIds, [id]);

useAppStore.getState().deleteBilibiliEntry(id);
assert.equal(useAppStore.getState().bilibiliEntries.length, 0);

console.log('bilibili store actions ok');
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npx tsx src/bilibili/bilibiliStore.test.ts`

Expected: FAIL because B站 store fields/actions do not exist.

- [ ] **Step 3: Implement store additions**

Add B站 types import, state arrays, action signatures, default empty arrays, actions, and persist migrate defaults. Bump persist `version` by one.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npx tsx src/bilibili/bilibiliStore.test.ts`

Expected: PASS and prints `bilibili store actions ok`.

## Task 3: B站 Screen Folder

**Files:**
- Create: `src/bilibili/BilibiliScreen.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement screen component after Tasks 1-2 are green**

Render `feed`, `search`, and `detail` views. Search uses fallback generation first; if model settings exist, try model JSON and pass through `parseBilibiliPayload`. The component must only write normalized B站 entries into store.

- [ ] **Step 2: Route from App**

Import `BilibiliScreen` and add `if (screen === 'bilibili') return <BilibiliScreen />;` before the generic placeholder copy.

- [ ] **Step 3: Typecheck**

Run: `npm run lint`

Expected: PASS.

## Task 4: Documentation And Final Verification

**Files:**
- Modify: `PROJECT_OUTLINE.md`

- [ ] **Step 1: Update docs**

Register `src/bilibili/` files and the `FeatureScreen -> BilibiliScreen` route.

- [ ] **Step 2: Full verification**

Run:

```powershell
npx tsx src/bilibili/bilibiliLogic.test.ts
npx tsx src/bilibili/bilibiliStore.test.ts
npm run lint
npm run build
Get-ChildItem -Path 'src' -Recurse -File | Select-String -Pattern 'crypto\.randomUUID','randomUUID' -Encoding UTF8
```

Expected: tests/lint/build pass; randomUUID search returns no matches.

---

## Self-Review

Spec coverage: the plan covers B站-only entries, independent folder, feed/detail/search, persistence, model/fallback generation, and documentation.

Scope check: real B站 scraping, audio extraction, login, and real playback remain out of scope, matching `docs/bilibili-plan.md`.

Type consistency: all store actions use `BilibiliVideoEntry` and `BilibiliSearchRecord`; UI only consumes those normalized entries.
