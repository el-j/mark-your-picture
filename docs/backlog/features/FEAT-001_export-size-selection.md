# FEAT-001: Export Size Selection

| Field | Value |
|-------|-------|
| **ID** | FEAT-001 |
| **Type** | Feature |
| **Status** | Draft |
| **Skill** | canvas |
| **Plan-Version** | 1 |
| **Created** | 2026-05-06 |
| **Deps** | none |

## Summary

After applying a watermark, the user can choose the output resolution before downloading. Three modes: **As Is** (original pixel dimensions), **Small** (longest side capped at 1280 px, aspect ratio preserved), and **Custom** (user-defined width in px, height auto-calculated from original aspect ratio, locked).

This applies to both single-image download and batch ZIP export.

## Acceptance Criteria

- [ ] **AC-1:** The download UI exposes a size selector with three options — "As Is", "Small", and "Custom" — visible before the user triggers download.
- [ ] **AC-2:** With "As Is" selected, the downloaded image has the same pixel dimensions as the source image (before any watermark canvas scaling).
- [ ] **AC-3:** With "Small" selected, the downloaded image has its longest side capped at 1280 px, the other dimension scaled proportionally (aspect ratio preserved). If the source is already ≤ 1280 px on its longest side, the image is downloaded at original size (no upscaling).
- [ ] **AC-4:** With "Custom" selected, the user can enter a width value (px, integer ≥ 1). The height field is read-only and auto-updates to `Math.round(sourceHeight * (inputWidth / sourceWidth))`. The downloaded image uses these exact dimensions.
- [ ] **AC-5:** The aspect ratio is always locked in Custom mode — changing width recalculates height, there is no independent height input.
- [ ] **AC-6:** The selected export size persists in `WatermarkContext` state and is reflected in the batch export (each image in the ZIP is scaled to the selected size using its own aspect ratio).
- [ ] **AC-7:** All new labels, placeholders, and ARIA labels are translated in both `en.ts` and `de.ts`.

## Edge Cases

- [ ] **EC-1:** Custom width = 0 or empty string → width input shows validation error, download button is disabled until valid value entered.
- [ ] **EC-2:** Custom width larger than source width → image is upscaled. No cap, no error. (User explicitly requested it.)
- [ ] **EC-3:** Source image is not yet loaded (no `sourceImg` in context) → size selector is rendered but greyed-out / disabled (same as download button today).
- [ ] **EC-4:** "Small" mode with a source image where width < height (portrait orientation) → 1280 px cap applies to height (longest side), width scales accordingly.
- [ ] **EC-5:** Custom width input receives non-numeric input (letters, symbols) → silently ignored, field keeps last valid value.
- [ ] **EC-6:** Batch export with "Custom" size — each file uses its own source dimensions to compute the output height from the shared custom width. A portrait and a landscape image in the same batch each preserve their own ratio.
- [ ] **EC-7:** User switches from "Custom" back to "As Is" → custom width/height fields disappear, no stale custom values affect download.

## Public Interface

### New state fields in `WatermarkState` (src/contexts/WatermarkContext.tsx)

```ts
exportSize: 'as-is' | 'small' | 'custom'   // default: 'as-is'
customExportWidth: number                    // default: 0 (means "not set")
```

### New action types in `WatermarkAction`

```ts
| { type: 'SET_EXPORT_SIZE'; payload: 'as-is' | 'small' | 'custom' }
| { type: 'SET_CUSTOM_EXPORT_WIDTH'; payload: number }
```

### New utility function in `src/lib/watermark.ts`

```ts
/**
 * Purpose: Compute output dimensions for export given source size + export mode.
 * Usage: Called by download handler and batch processor before canvas scaling.
 * Rationale: Single source of truth for resize logic, testable without DOM.
 * Feature: FEAT-001
 */
export function computeExportSize(
  sourceWidth: number,
  sourceHeight: number,
  mode: 'as-is' | 'small' | 'custom',
  customWidth?: number
): { width: number; height: number }
```

### Modified call sites

- `ActionButtons.tsx` — `getBlob()` passes computed dimensions to canvas scaling before `toBlob()`
- `batch.ts` — `processBatch()` accepts `exportSizeMode` + `customExportWidth`, calls `computeExportSize()` per file

## Test Specification (for black-box agent)

**Test layer:** Vitest (unit) + Playwright (E2E)

**Fixtures:**
- `e2e/fixtures/` — use any existing sample image fixture
- For unit tests: synthetic `sourceWidth`/`sourceHeight` values (no real image needed)

**Vitest unit tests (`src/test/watermark.test.ts`):**

| AC/EC | Test description | Assertion |
|-------|-----------------|-----------|
| AC-2 | `computeExportSize(800, 600, 'as-is')` | returns `{800, 600}` |
| AC-3 | `computeExportSize(2400, 1800, 'small')` | returns `{1280, 960}` (longest=width) |
| AC-3 | `computeExportSize(1800, 2400, 'small')` | returns `{960, 1280}` (longest=height) |
| AC-3 | `computeExportSize(800, 600, 'small')` | returns `{800, 600}` (no upscale) |
| AC-4 | `computeExportSize(800, 600, 'custom', 400)` | returns `{400, 300}` |
| EC-1 | `computeExportSize(800, 600, 'custom', 0)` | throws or returns original (document behavior) |
| EC-2 | `computeExportSize(800, 600, 'custom', 1600)` | returns `{1600, 1200}` (upscale allowed) |
| EC-4 | `computeExportSize(600, 800, 'small')` | returns `{960, 1280}` (portrait, height=1280) |
| EC-6 | `computeExportSize(600, 800, 'custom', 300)` | returns `{300, 400}` (portrait ratio) |

**Playwright E2E tests (`e2e/tool.spec.ts`):**

| AC/EC | Test description |
|-------|-----------------|
| AC-1 | After loading an image, size selector is visible with 3 options |
| AC-2 | Download with "As Is" → downloaded file pixel dimensions match source |
| AC-3 | Download with "Small" using a >1280px image → file longest side = 1280 |
| AC-4 | Select "Custom", enter width 400 → height field shows correct ratio value |
| AC-5 | No height input field in Custom mode (height is read-only/computed display) |
| EC-1 | Enter width = 0 → download button disabled |
| EC-3 | Size selector visible but disabled when no image loaded |
| EC-7 | Switch Custom → As Is → custom fields no longer visible |

**Note:** Pixel dimension assertions in Playwright require reading the downloaded file or using canvas `width`/`height` attributes — use the canvas element's dimensions after apply as a proxy.

## Affected Files

| File | Change |
|------|--------|
| `src/lib/watermark.ts` | Add `computeExportSize()` export |
| `src/lib/types.ts` | Add `ExportSizeMode` type alias |
| `src/contexts/WatermarkContext.tsx` | Add `exportSize` + `customExportWidth` to state + actions + reducer |
| `src/components/tool/ActionButtons.tsx` | Apply `computeExportSize()` in `getBlob()` before `canvas.toBlob()` |
| `src/components/tool/Sidebar.tsx` or new `ExportSizeCard.tsx` | New UI component for size selector |
| `src/lib/batch.ts` | Pass export size params to `processBatch()`, call `computeExportSize()` per file |
| `src/i18n/locales/en.ts` | Add i18n keys (see below) |
| `src/i18n/locales/de.ts` | Add i18n keys (see below) |
| `src/test/watermark.test.ts` | Unit tests for `computeExportSize()` |
| `e2e/tool.spec.ts` | E2E tests for size selector UI + download behavior |

### New i18n Keys

```ts
// en.ts
'actions.exportSize': 'Export Size',
'actions.exportSizeAsIs': 'As Is',
'actions.exportSizeSmall': 'Small (max 1280 px)',
'actions.exportSizeCustom': 'Custom',
'actions.exportCustomWidth': 'Width (px)',
'actions.exportCustomHeight': 'Height (px)',  // read-only label
'actions.exportCustomWidthPlaceholder': 'e.g. 1920',
'actions.exportSizeAriaLabel': 'Select export size',

// de.ts
'actions.exportSize': 'Exportgröße',
'actions.exportSizeAsIs': 'Original',
'actions.exportSizeSmall': 'Klein (max. 1280 px)',
'actions.exportSizeCustom': 'Benutzerdefiniert',
'actions.exportCustomWidth': 'Breite (px)',
'actions.exportCustomHeight': 'Höhe (px)',
'actions.exportCustomWidthPlaceholder': 'z. B. 1920',
'actions.exportSizeAriaLabel': 'Exportgröße auswählen',
```

## Implementation Steps

1. **`src/lib/types.ts`** — add `export type ExportSizeMode = 'as-is' | 'small' | 'custom'`
2. **`src/lib/watermark.ts`** — implement `computeExportSize()`: pure function, no DOM, no React
3. **`src/contexts/WatermarkContext.tsx`** — add `exportSize: ExportSizeMode` (default `'as-is'`) + `customExportWidth: number` (default `0`) to initial state; add `SET_EXPORT_SIZE` and `SET_CUSTOM_EXPORT_WIDTH` to reducer
4. **`src/components/tool/ExportSizeCard.tsx`** (new file) — UI: radio group or segmented control for As Is / Small / Custom; conditional width input (number, min=1) with computed read-only height display; disabled when no image loaded
5. **`src/components/tool/ActionButtons.tsx`** — in `getBlob()`, call `computeExportSize()` and scale the canvas to output dimensions before `canvas.toBlob()` (draw scaled version to a temp canvas)
6. **`src/lib/batch.ts`** — extend `processBatch()` to accept `exportSizeMode` + `customExportWidth`, call `computeExportSize(file.naturalWidth, file.naturalHeight, mode, customWidth)` per file
7. **`src/components/tool/SinglePanel.tsx`** — include `<ExportSizeCard />` in layout (above or below ActionButtons)
8. **`src/i18n/locales/en.ts` + `de.ts`** — add all new keys listed above
9. **`src/test/watermark.test.ts`** — add unit tests for `computeExportSize()` (9 cases above)
10. **`e2e/tool.spec.ts`** — add E2E tests (8 cases above)
11. Run `npm run check:fix && npm test && npm run e2e`

## Cross-Cutting Checklist

- [ ] i18n: all user-facing strings use i18n keys in both en.ts and de.ts
- [ ] TypeScript: no implicit `any`, `ExportSizeMode` typed everywhere
- [ ] Error handling: invalid custom width → download button disabled (no silent fail)
- [ ] Mobile: ExportSizeCard touch interactions work
- [ ] `computeExportSize()` is pure — no side effects, no DOM access
- [ ] `Feature: FEAT-001` in JSDoc on `computeExportSize()` and `ExportSizeCard`
- [ ] Canvas temp scaling uses `drawImage()` (not CSS transform) — actual pixel output
- [ ] Batch: each file uses its own source dimensions for ratio calculation
- [ ] Biome: `npm run check` passes
- [ ] Build: `npm run build` succeeds
