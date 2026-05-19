# FEAT-003: Mobile Touch Reliability + iOS Install Flow

| Field | Value |
|-------|-------|
| **ID** | FEAT-003 |
| **Type** | Feature |
| **Status** | Done |
| **Skill** | pwa |
| **Plan-Version** | 1 |
| **Created** | 2026-05-19 |
| **Deps** | FEAT-002 |

## Summary

Improve mobile-first UX for Android/iOS by hardening touch gestures (canvas drag + bottom sheet behavior) and fixing install banner behavior for Safari/iOS where `beforeinstallprompt` is not available.

## Acceptance Criteria

- [x] AC-1: Free-position watermark dragging uses robust pointer interactions and works smoothly on touch devices.
- [x] AC-2: Drag position is clamped, so watermark cannot get lost outside bounds from touch drift.
- [x] AC-3: Bottom sheet supports reliable swipe-down dismissal and avoids background scroll bleed.
- [x] AC-4: Install banner has an iOS Safari fallback flow with localized guidance.
- [x] AC-5: Banner dismissal persists for a cooldown period (not every tab/session).
- [x] AC-6: Mobile viewport supports safe-area usage for iOS notched devices.

## Edge Cases

- [x] EC-1: Pointer cancel events clear drag state correctly.
- [x] EC-2: Multi-touch does not break free-drag behavior.
- [x] EC-3: Banner does not show when app is already running standalone.

## Affected Files

- `src/components/tool/WatermarkCanvas.tsx`
- `src/components/ui/BottomSheet.tsx`
- `src/components/ui/InstallBanner.tsx`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/de.ts`
- `index.html`

## Validation

- [x] `npm run check`
- [x] `npm test`
- [x] iOS fallback path verified by unit test using Safari iPhone UA simulation

## Execution Report

- Replaced split mouse/touch drag handling on canvas with pointer-event based interactions.
- Added drag coordinate clamping for reliable free placement boundaries.
- Implemented bottom-sheet swipe-down dismiss and body scroll-lock behavior for mobile browsers.
- Added iOS Safari install fallback messaging and persistent dismissal cooldown handling.
- Added i18n keys for iOS install instructions in both English and German.
- Added viewport safe-area support via `viewport-fit=cover`.
- Added unit coverage for iOS fallback banner rendering.