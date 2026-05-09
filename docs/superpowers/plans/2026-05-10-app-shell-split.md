# App Shell Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Start reducing `src/App.tsx` by extracting stable phone shell data before moving UI screens.

**Architecture:** Split from the outside inward. First move pure desktop app metadata into `src/shell/appCatalog.tsx`, then later move shell components and feature routing after their dependencies are smaller.

**Tech Stack:** Vite, React, TypeScript, lucide-react, existing `npx tsx` test style.

---

## File Structure

- Create `src/shell/appCatalog.tsx`: owns desktop page app metadata and dock app metadata.
- Create `src/shell/appCatalog.test.ts`: verifies app catalog screen ids, page placement, dock order, and uniqueness.
- Modify `src/App.tsx`: imports `pageApps` and `dockApps` instead of defining them inline.
- Modify `PROJECT_OUTLINE.md`: records the new shell module.
- Modify `docs/work-log.md`: records the split.

## First Slice

### Task 1: Extract Desktop App Catalog

**Files:**
- Create: `src/shell/appCatalog.tsx`
- Create: `src/shell/appCatalog.test.ts`
- Modify: `src/App.tsx`
- Modify: `PROJECT_OUTLINE.md`
- Modify: `docs/work-log.md`

- [ ] **Step 1: Write the failing catalog test**

Add a test that imports `pageApps`, `dockApps`, and `getAllCatalogScreens` from `src/shell/appCatalog.tsx`. It should fail before the new module exists.

- [ ] **Step 2: Verify the test fails**

Run `npx tsx src/shell/appCatalog.test.ts`.
Expected: module-not-found failure for `./appCatalog`.

- [ ] **Step 3: Move the catalog**

Create `src/shell/appCatalog.tsx` with the existing desktop and dock app arrays, their local `Screen` union, and `getAllCatalogScreens()`.

- [ ] **Step 4: Wire App to the catalog**

Remove inline `pageApps` and `dockApps` from `src/App.tsx`, then import them from `src/shell/appCatalog`.

- [ ] **Step 5: Run targeted and full checks**

Run:

```powershell
npx tsx src/shell/appCatalog.test.ts
npm run lint
npm run build
```

- [ ] **Step 6: Update documentation**

Update `PROJECT_OUTLINE.md` and append `docs/work-log.md`.

- [ ] **Step 7: Commit and push**

Commit only the catalog split and docs.

```powershell
git add src/App.tsx src/shell/appCatalog.tsx src/shell/appCatalog.test.ts PROJECT_OUTLINE.md docs/work-log.md docs/superpowers/plans/2026-05-10-app-shell-split.md
git commit -m "Split desktop app catalog"
git push
```

## Later Slices

1. Move `FeatureScreen` routing after shared screen props are explicit.
2. Move `Desktop`, `Draggable`, `CustomWidgetView`, and `AppIcon` into `src/shell/`.
3. Move one business screen at a time out of `App.tsx`, starting with low-dependency screens.
4. Only introduce life events after the shell split has a clear place for notifications and timeline access.
