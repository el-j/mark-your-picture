# /review — White-Box Code Review

**Arguments:** Task plan path + working directory (called by /execute-task)

White-box code review of an implementation against its task plan. Produces findings report. Never modifies code.

---

## Phase 1: Load Context

1. Read the task plan (acceptance criteria, edge cases, public interface)
2. Check `Plan-Version` in plan header — store as `EXPECTED_VERSION`
3. Read `CLAUDE.md` for project conventions
4. Run in worktree: `git diff {BASE_BRANCH}...HEAD` — this is the full changeset

---

## Phase 2: Plan-Version Check

```bash
ACTUAL_VERSION=$(grep "Plan-Version" {TASK_FILE} | awk '{print $NF}')
```

If `ACTUAL_VERSION != EXPECTED_VERSION`: add WARNING "Review is against plan version {ACTUAL_VERSION}, expected {EXPECTED_VERSION}."
This does NOT halt the review.

---

## Phase 3: Acceptance Criteria Coverage

For EACH AC in the task plan:
- Is there corresponding implementation in the diff?
- Does the implementation actually satisfy the AC semantically (not just syntactically)?

Finding levels:
- CRITICAL: AC has no corresponding implementation
- WARNING: AC partially implemented (edge case missing)

**AC content cannot be changed by the review agent.** If an AC appears incorrect, document it as a finding with a recommendation, but leave the AC unchanged.

---

## Phase 4: Edge Case Handling

For EACH edge case defined in the plan:
- Is the edge case handled in the implementation?
- Is the handling correct (e.g. graceful error, fallback UI, validation)?

Common edge cases for this project:
- No image loaded when action triggered
- Empty text watermark string
- Very large image (memory pressure)
- Very small image (watermark larger than image)
- Batch with 0 items or 1000+ items
- Canvas context null (fallback?)
- File read error (unsupported format)

---

## Phase 5: Production Readiness

Check for:
- [ ] Error states handled with user feedback (Toast?)
- [ ] Loading/processing states shown (ProgressBar?)
- [ ] User input sanitized at boundaries
- [ ] Object URLs revoked (`URL.revokeObjectURL`)
- [ ] Canvas resources cleaned up
- [ ] No `console.log` left in production code
- [ ] No hardcoded strings (must use i18n)
- [ ] New i18n keys added to BOTH `en.ts` AND `de.ts`

---

## Phase 6: Code Conventions (CLAUDE.md)

Check against project conventions:
- TypeScript strict mode — no implicit `any`, no type assertions without justification
- Functional components only — no class components
- Tailwind classes for styling — no inline `style={}` except canvas/dynamic
- Biome compliance — run `npm run check` mentally against the diff
- No comments unless WHY is non-obvious
- `Feature: {ID}` in JSDoc on new/changed exports
- Context API used correctly (no prop drilling where context applies)
- Pure lib functions — `src/lib/` has no React imports

---

## Phase 7: Security Basics

- No `innerHTML` with user-controlled content
- No `eval()` or `new Function()`
- File type validation before canvas operations
- No sensitive data logged

---

## Finding Severity

| Severity | Definition | Blocks merge? |
|----------|-----------|---------------|
| CRITICAL | AC not implemented, security issue, data corruption risk | Yes |
| WARNING | Partial implementation, missing edge case, convention violation | No |
| INFO | Suggestion, style improvement | No |

---

## Status Determination

- `pass`: 0 critical, 0 warnings
- `warn`: 0 critical, ≥1 warnings
- `fail`: ≥1 critical (triggers fix loop in /execute-task, max 2 iterations)

---

## Follow-Up Queue

Out-of-scope findings go to `.build/followup_queue.json`:
- Architecture concerns
- Tech debt observed
- Performance opportunities
- Ideas for future tasks

Categories: VERIFY | REFAC | IDEA. Priority: high | medium | low.

---

## Result

```
STATUS: pass|warn|fail
FINDINGS: {n} total ({critical} critical, {warnings} warnings, {info} info)
CRITICAL: [list or "none"]
CONVENTIONS: OK|{n} violations
SUMMARY: [1 sentence]
```

## Learnings

*(Agents append learnings here after tasks)*
