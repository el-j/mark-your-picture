# /validate — Deep Plan Validation

**Arguments:** $ARGUMENTS (task ID, e.g. FEAT-003)

Deep-checks a task plan against the actual codebase before execution. Catches conflicts, missing dependencies, wrong assumptions. Can be triggered manually or automatically by /execute-task (Phase 1*).

---

## Phase 1: Load Context

1. Resolve task ID from arguments
2. Find task file: `docs/backlog/{type}/{ID}_*.md`
3. Read task plan completely
4. Read `CLAUDE.md`
5. Read `docs/orchestrator_state.json` for deps and project state

---

## Phase 2: Build Plan Inventory

Extract ALL concrete references from the task plan:
- File paths (relative to project root)
- Function/method names + expected signatures
- Interface/type definitions
- Import paths
- Component props
- Context values
- i18n keys referenced

---

## Phase 3: Code Reality Check (8 Checks)

### Check 1: Files & Paths
For EACH referenced file: does it exist? Has it been renamed/moved?
```bash
find src/ -name "{filename}" 2>/dev/null
```

### Check 2: Interfaces & Signatures
For EACH referenced function/interface: does the actual signature match?
```bash
grep -n "{functionName}" src/lib/types.ts src/lib/watermark.ts src/lib/batch.ts
```

### Check 3: Recently Merged Changes
```bash
git log --oneline --since="$(git log -1 --format=%ci {TASK_FILE})" main
```
Do any recent merges overlap with the files the plan touches?

### Check 4: AC Testability
For EACH AC: is it concrete enough for an automated Vitest or Playwright test?
Red flags: "works correctly", "looks good", "is fast", "feels responsive"

### Check 5: Scope & Side Effects
- Circular imports from the changed files?
- Would changing `src/lib/watermark.ts` break existing tests?
- Does the change affect the WatermarkContext API used by other components?

### Check 6: Production Readiness
- Error states handled (file read error, canvas error, network error)?
- Loading/processing states shown to user?
- User input validation?
- Resource cleanup (object URLs, canvas elements)?

### Check 7: Edge Cases
- Min. 3 edge cases documented?
- Cover: empty inputs, boundary values, concurrent ops, mobile/desktop, offline/PWA?

### Check 8: Test Specification
- Public interface documented?
- Expected behavior specified?
- Testable preconditions (fixtures, mock data)?
- Scope boundaries clear (Vitest vs Playwright)?

---

## Phase 4: Classify Findings

| Severity | Definition |
|----------|-----------|
| `INFO` | Observation, no action needed |
| `MINOR` | Small gap, easy fix, doesn't block |
| `MAJOR` | Significant issue, plan needs update |
| `BLOCKER` | Task cannot proceed without replanning |

---

## Phase 5: Update Plan

For MINOR/MAJOR findings, update the task plan:
1. Fix affected sections (ACs, edge cases, affected files)
2. Add/update Plan-Revision section:
   ```markdown
   ## Plan-Revision
   | # | Severity | Finding | Action |
   |---|----------|---------|--------|
   | 1 | MAJOR | Referenced `applyWatermark()` signature changed | Updated AC-3 |
   ```
3. Increment `Plan-Version` in header
4. Commit: `docs({ID}): revise plan V{N} -- {M} findings`

For BLOCKER: do NOT update plan. Report to user, set status → "blocked".

---

## Phase 6: Risk Assessment

| Risk | Criteria |
|------|---------|
| `low` | 0 findings or INFO only |
| `medium` | MINOR only, no MAJOR |
| `high` | MAJOR findings, ACs changed |
| `blocker` | BLOCKER finding |

---

## Result

```
PLAN_STATUS: valid|revised|blocked
FINDINGS: {total} ({info} INFO, {minor} MINOR, {major} MAJOR, {blocker} BLOCKER)
FILES_CHECKED: {count}
CRITERIA_VALID: {valid}/{total} acceptance criteria
EDGE_CASES: {count} defined (min. 3)
PROD_READY: {open} open / {total} checked
TEST_SPEC: complete|added|incomplete
REVISION_SUMMARY: [1 sentence]
RISK: low|medium|high|blocker
```

## Learnings

*(Agents append learnings here after tasks)*
