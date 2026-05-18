# /testfix — Intelligent Test Failure Analysis

**Arguments:** Task ID + task plan + worktree + failed tests + iteration (called by /execute-task Phase 3b)

Analyzes each failing test individually and decides: fix the code, or fix the test (if the test is wrong). Never weakens a correct test.

---

## Phase 1: Triage Failures

For EACH failing test, classify independently:

| Category | Criteria | Action |
|----------|---------|--------|
| CODE_BUG | Test is correct, implementation is wrong | Fix implementation |
| TEST_BUG | Test has a wrong assertion, wrong fixture, or tests the wrong thing | Fix test |
| INFRASTRUCTURE | Timeout, missing fixture, environment issue | Fix infrastructure |
| DESIGN_ISSUE | AC cannot be tested without refactoring the implementation | Add to Follow-Up Queue |

**Never weaken a semantically correct test.** If a test checks the right behavior but fails because the implementation is wrong, fix the implementation.

---

## Phase 2: Per-Test Analysis

For EACH failing test:

1. Read the test code
2. Read the task plan (AC and edge case the test is for)
3. Run the test in isolation to get the exact error:
   ```bash
   cd {WORKTREE_PATH}
   # Vitest
   npm test -- --reporter=verbose -t "{test name}"
   # Playwright
   npm run e2e -- --grep "{test title}"
   ```
4. Classify (CODE_BUG | TEST_BUG | INFRASTRUCTURE | DESIGN_ISSUE)
5. Apply fix

---

## Phase 3: Apply Fixes

### CODE_BUG
- Read the relevant implementation file
- Fix the specific failing logic
- Do NOT refactor surrounding code (out of scope)
- Commit: `fix({ID}): fix {description} -- testfix iteration {N}`

### TEST_BUG
Only fix if the test has a genuine error:
- Wrong assertion value (off-by-one, wrong expected output)
- Wrong fixture data
- Testing implementation details instead of behavior

Do NOT fix if the test is correct and the implementation is wrong (that's CODE_BUG).

### INFRASTRUCTURE
- Missing fixture → create it in `e2e/fixtures/`
- Timeout → increase timeout in the specific test
- Missing mock → add mock setup

### DESIGN_ISSUE
Cannot be fixed in this iteration. Add to Follow-Up Queue:
```json
{
  "category": "REFAC",
  "priority": "medium",
  "title": "AC-X not testable — implementation needs abstraction",
  "description": "The canvas drawing logic is not injectable/mockable"
}
```

---

## Phase 4: Re-Run

After all fixes applied:
```bash
cd {WORKTREE_PATH}
npm test && npm run e2e
```

Report remaining failures (if any) back to /execute-task.

---

## Result

```
STATUS: pass|fail|partial
FIXED: {n} tests fixed ({code_bugs} code bugs, {test_bugs} test bugs, {infra} infra)
REMAINING: {n} tests still failing
DESIGN_ISSUES: {n} added to follow-up queue
SUMMARY: [1 sentence]
```

## Learnings

*(Agents append learnings here after tasks)*
