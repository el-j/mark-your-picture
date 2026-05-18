# {FEAT-XXX}: {Title}

| Field | Value |
|-------|-------|
| **ID** | FEAT-XXX |
| **Type** | Feature |
| **Status** | Draft |
| **Skill** | null |
| **Plan-Version** | 1 |
| **Created** | {date} |
| **Deps** | none |

## Summary

{1-2 sentences describing what this feature does and why it matters.}

## Acceptance Criteria

- [ ] AC-1: Given {precondition}, when {action}, then {measurable outcome}
- [ ] AC-2: Given {precondition}, when {action}, then {measurable outcome}
- [ ] AC-3: Given {precondition}, when {action}, then {measurable outcome}

## Edge Cases

- [ ] EC-1: {edge case description and expected behavior}
- [ ] EC-2: {edge case description and expected behavior}
- [ ] EC-3: {edge case description and expected behavior}

## Public Interface

{What gets exported, exposed, or changed in the public API?}

```ts
// Example:
export function applyWatermark(options: WatermarkOptions): Promise<Blob>
```

## Test Specification (for black-box agent)

**Test layer:** Vitest | Playwright | Both

**Fixtures needed:**
- `e2e/fixtures/sample-image.jpg` — existing
- {any new fixtures}

**Key assertions:**
- AC-1: {what to assert, what API to use}
- AC-2: {what to assert}
- AC-3: {what to assert}

**Edge case assertions:**
- EC-1: {assertion}

## Affected Files

- `src/lib/watermark.ts` — {what changes}
- `src/components/tool/...` — {what changes}
- `src/i18n/locales/en.ts` — add keys: {list}
- `src/i18n/locales/de.ts` — add keys: {list}
- `src/test/watermark.test.ts` — {new tests}
- `e2e/tool.spec.ts` — {new E2E tests}

## Implementation Steps

1. {step 1}
2. {step 2}
3. Add i18n keys to `en.ts` and `de.ts`
4. Run `npm run check:fix`
5. Add `Feature: FEAT-XXX` to JSDoc on modified exports

## Cross-Cutting Checklist

- [ ] i18n: all user-facing strings use i18n keys in both en.ts and de.ts
- [ ] TypeScript: no implicit `any`, all types defined
- [ ] Error handling: errors shown via Toast, not console.log
- [ ] Mobile: touch interactions work (if UI change)
- [ ] PWA: no breaking changes to service worker caching
- [ ] Tests: Vitest unit tests for lib functions
- [ ] E2E: Playwright test for user-visible flow
- [ ] Biome: `npm run check` passes
- [ ] Build: `npm run build` succeeds
