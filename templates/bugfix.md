# {BUG-XXX}: {Title}

| Field | Value |
|-------|-------|
| **ID** | BUG-XXX |
| **Type** | Bug Fix |
| **Status** | Draft |
| **Skill** | null |
| **Plan-Version** | 1 |
| **Created** | {date} |
| **Deps** | none |
| **Severity** | low | medium | high | critical |

## Bug Description

**Steps to reproduce:**
1. {step 1}
2. {step 2}
3. {step 3}

**Expected behavior:** {what should happen}
**Actual behavior:** {what actually happens}
**Affected versions:** {version or "all"}
**Affected browsers:** {browsers affected, e.g. "Chrome only", "all"}

## Root Cause Analysis

{Brief analysis of why the bug occurs. Reference specific file:line if known.}

## Acceptance Criteria

- [ ] AC-1: Given {reproduction steps}, the bug no longer occurs
- [ ] AC-2: {regression check — existing functionality still works}
- [ ] AC-3: {edge case that previously caused the bug}

## Edge Cases

- [ ] EC-1: {related edge case}
- [ ] EC-2: {related edge case}
- [ ] EC-3: {boundary condition}

## Public Interface

{Does this fix change any exported API? If yes, document what changes.}
{Usually: "No API changes — internal fix only."}

## Test Specification (for black-box agent)

**Test layer:** Vitest | Playwright | Both

**Regression test:** Write a test that would have caught this bug.

**Key assertions:**
- AC-1: {reproduction steps as test → assert no error/correct output}
- AC-2: {regression check assertion}

## Affected Files

- `src/lib/...` — {what changes}
- `src/test/...` — add regression test

## Fix Description

{What specifically will be changed to fix the bug. Keep scope minimal — do not refactor while fixing.}

## Cross-Cutting Checklist

- [ ] Regression test added that would catch this bug
- [ ] No behavioral changes beyond the bug fix
- [ ] TypeScript: no implicit `any`
- [ ] Biome: `npm run check` passes
- [ ] Build: `npm run build` succeeds
