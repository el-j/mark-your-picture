# /test — Black-Box Acceptance Tests

**Arguments:** Task ID + task plan path + working directory (called by /execute-task)

Write and run acceptance tests based SOLELY on the task plan. Never reads implementation code. Tests examine behavior, not code structure.

---

## CRITICAL CONSTRAINT

**Do NOT read any implementation files.** Do not look at:
- `src/lib/watermark.ts`, `src/lib/batch.ts`
- Any component file
- Any hook or context file

You may ONLY read:
- The task plan
- Existing test files (to understand testing patterns)
- `CLAUDE.md` (for testing conventions)
- `src/lib/types.ts` (for type definitions used in test assertions)

---

## Phase 1: Plan-Version Check

```bash
PLAN_VERSION=$(grep "Plan-Version" {TASK_FILE} | awk '{print $NF}')
```
If plan version doesn't match what /execute-task reported: add note, continue.

---

## Phase 2: Extract Requirements

From the task plan, extract:
1. All acceptance criteria (ACs)
2. All edge cases
3. Public interface (what's exported/exposed)
4. Test specification section

---

## Phase 3: Determine Test Strategy

| Change Type | Test Layer | Framework |
|-------------|-----------|-----------|
| Pure lib function (watermark.ts, batch.ts) | Unit | Vitest + `src/test/` |
| React component/hook | Component | Vitest + @testing-library/react |
| Full user flow | E2E | Playwright + `e2e/` |
| Visual regression | Visual | Playwright + snapshots |
| Mixed | Both layers | Vitest + Playwright |

For this project, default to:
- **Vitest** for logic in `src/lib/` and hooks
- **Playwright** for user-visible features (watermark applied, download triggered, batch works)

---

## Phase 4: Write Tests

### Plan Tests (mandatory — one per AC + one per edge case)

For EACH AC, write at minimum 1 test:
```
AC: "When user sets opacity to 50%, watermark renders at 50% opacity"
Test: verify canvas globalAlpha = 0.5 when opacity input = 50
```

For EACH edge case:
```
Edge: "Empty text watermark — no watermark drawn"
Test: verify canvas drawText not called when text = ""
```

### Derived Tests (standard scenarios)

- Null/undefined inputs → graceful handling
- Boundary values (0, 100, max) → correct clamping
- i18n: text in both English and German renders correctly
- Mobile: touch interactions (if applicable)

### Test Naming

```ts
// Vitest
it('renders watermark at 50% opacity when opacity = 50', () => { ... })
it('does not draw watermark when text is empty', () => { ... })

// Playwright
test('user can apply text watermark and download image', async ({ page }) => { ... })
```

---

## Phase 5: Run Tests

```bash
cd {WORKTREE_PATH}

# Vitest unit tests
npm test -- --reporter=verbose

# Playwright E2E (if E2E tests written)
npm run e2e -- --reporter=list
```

All tests must pass. On failure → report to /execute-task for Phase 3b (testfix loop).

---

## Phase 6: Validate Coverage

For EACH AC: at least 1 test exists that exercises it.
For EACH edge case: at least 1 test exists.

```
COVERAGE:
AC-1: PASS — src/test/watermark.test.ts::it('renders at 50% opacity')
AC-2: PASS — e2e/tool.spec.ts::test('user can download with watermark')
AC-3: FAIL — No test found
```

Report missing coverage. Do not weaken tests to make them pass — fix the implementation instead.

---

## Follow-Up Queue

If an AC is not testable due to missing abstractions or internal-only behavior:
```json
{
  "category": "VERIFY",
  "priority": "medium",
  "title": "AC-3 not directly testable — requires refactor",
  "description": "applyWatermark() does not expose result for assertion"
}
```

---

## Result

```
STATUS: pass|fail
TESTS_WRITTEN: {n}
TESTS_PASSED: {n}/{m}
EDGE_CASES: {tested}/{planned}
SUMMARY: [1 sentence]
```

## Learnings

*(Agents append learnings here after tasks)*
