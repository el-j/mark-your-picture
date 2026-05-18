# {REFAC-XXX}: {Title}

| Field | Value |
|-------|-------|
| **ID** | REFAC-XXX |
| **Type** | Refactor |
| **Status** | Draft |
| **Skill** | null |
| **Plan-Version** | 1 |
| **Created** | {date} |
| **Deps** | none |

## Summary

{What is being refactored and why. What problem does this solve?}

## Goal

{The desired end state after refactoring.}

## Non-Goals

{Explicitly list what this refactor does NOT change (behavior, API, user-visible output).}

## Acceptance Criteria

- [ ] AC-1: All existing tests pass unchanged (no behavioral regression)
- [ ] AC-2: {specific structural improvement, e.g. "WatermarkContext is split into two focused contexts"}
- [ ] AC-3: {measurable code quality improvement, e.g. "No file in src/lib/ exceeds 200 lines"}

## Edge Cases

- [ ] EC-1: Refactored code handles the same edge cases as before
- [ ] EC-2: {specific edge case that was tricky in original}
- [ ] EC-3: {boundary condition to verify}

## Public Interface Changes

{Does this refactor change exported APIs? If yes, document old → new.}
{If no: "Public interface unchanged — internal implementation only."}

## Test Specification (for black-box agent)

**Note:** For refactors, the black-box agent primarily runs the EXISTING test suite.

**Key assertions:**
- AC-1: `npm test && npm run e2e` — all existing tests pass
- AC-2: {structural check — e.g. grep for a pattern that should no longer exist}

**New tests needed:** {yes/no — if yes, describe what}

## Affected Files

- `src/...` — {before → after}
- `src/...` — {before → after}

## Migration Plan

1. {step 1 — e.g. create new module}
2. {step 2 — e.g. move functions}
3. {step 3 — e.g. update imports}
4. {step 4 — e.g. delete old file}
5. Run `npm run check:fix && npm test && npm run build`

## Cross-Cutting Checklist

- [ ] Zero behavioral changes (black-box identical)
- [ ] All imports updated
- [ ] No dead code left behind
- [ ] TypeScript: no new `any`, all types preserved
- [ ] Biome: `npm run check` passes
- [ ] Build: `npm run build` succeeds
- [ ] All tests pass: `npm test && npm run e2e`
