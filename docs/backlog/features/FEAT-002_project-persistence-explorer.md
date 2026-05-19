# FEAT-002: Project Persistence + Explorer

| Field | Value |
|-------|-------|
| **ID** | FEAT-002 |
| **Type** | Feature |
| **Status** | Done |
| **Skill** | null |
| **Plan-Version** | 1 |
| **Created** | 2026-05-18 |
| **Deps** | none |

## Summary

Bring project-style persistence from the pcb-coil-tool approach into mark-your-picture: keep a quick local draft, support named saved projects in IndexedDB, and provide a projects explorer page to save/open/duplicate/delete/import/export/cleanup.

## Acceptance Criteria

- [x] AC-1: Draft watermark settings persist in localStorage and hydrate on reload.
- [x] AC-2: Users can save named projects to IndexedDB from the app UI.
- [x] AC-3: Users can view saved projects in a dedicated explorer route and open them into the editor.
- [x] AC-4: Users can duplicate and delete saved projects from the explorer.
- [x] AC-5: Users can export one saved project as JSON and import a JSON project file.
- [x] AC-6: Users can cleanup older projects (keep newest N) and clear all projects with confirmation.
- [x] AC-7: All new user-facing strings are translated in both en.ts and de.ts.

## Edge Cases

- [x] EC-1: Corrupted localStorage draft falls back to defaults.
- [x] EC-2: Import with invalid schema shows failure feedback and does not break existing projects.
- [x] EC-3: Save with empty project name uses a localized default fallback name.
- [x] EC-4: Explorer handles empty state gracefully when no projects exist.

## Public Interface

```ts
export interface SavedProjectSnapshot {
  id: string;
  name: string;
  state: PersistedWatermarkState;
  createdAt: string;
  updatedAt: string;
}
```

## Test Specification (for black-box agent)

**Test layer:** Vitest + Playwright

**Key assertions:**
- AC-1: Reload restores persisted settings.
- AC-2/3: Save + open project updates editor state.
- AC-4: Duplicate increases count; delete removes target.
- AC-5: Export creates file; import adds project.
- AC-6: Cleanup removes old projects; clear all empties list.

## Affected Files

- `src/contexts/WatermarkContext.tsx` — add project draft + snapshot operations
- `src/lib/projectStorage.ts` — IndexedDB CRUD + import/export parsing
- `src/components/pages/ProjectsPage.tsx` — explorer UI
- `src/components/layout/DesktopNav.tsx` — add projects nav item
- `src/App.tsx` — add /projects route
- `src/i18n/locales/en.ts` — add project keys
- `src/i18n/locales/de.ts` — add project keys

## Implementation Steps

1. Add typed project storage utilities (idb) and import/export helpers.
2. Extend WatermarkContext with project-oriented APIs and draft persistence.
3. Build Projects page with open, save, duplicate, delete, cleanup, clear, import, export.
4. Wire route/nav and i18n keys in en/de.
5. Run quality checks and mark task status updates in orchestration file.

## Cross-Cutting Checklist

- [x] i18n: new strings exist in en.ts and de.ts
- [x] TypeScript: strict-safe types, no implicit any
- [x] Error handling: graceful failures on storage/import parsing
- [x] Tests: existing suite passes with persistence integration
- [x] Build: npm run build passes

## Execution Report

- Implemented IndexedDB-backed project repository in `src/lib/projectStorage.ts` using `idb`.
- Extended `WatermarkContext` with project draft metadata and save/load APIs.
- Added `ProjectsPage` route with save/open/duplicate/delete/import/export/cleanup/clear-all flows.
- Wired navigation updates and quick tool action access to the projects explorer.
- Added localized project strings in both `en.ts` and `de.ts`.

## Validation

- `npm run build` passed.
- `npm test` passed (59 tests).
- `npm run check` reports only nursery class-order warnings for `ProjectsPage.tsx`; no errors.