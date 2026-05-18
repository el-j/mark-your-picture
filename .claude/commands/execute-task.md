# /execute-task — Fully Automated Task Execution

**Task-ID:** $ARGUMENTS

Fully automated execution of a single task with quality gates, black-box testing and learning.
Main = dispatcher, sub-agents = workers.

---

## Phase Tracking

Update phase in `docs/orchestrator_state.json` at EVERY transition.
Category path: FEAT → `.features`, BUG → `.bugfixes`, REFAC → `.refactors`, TEST → `.tests`

```bash
(
  flock -x 201
  jq --arg id "{ID}" '.{category}[$id].phase = "{phase}"' docs/orchestrator_state.json \
    > docs/orchestrator_state.json.tmp && \
    mv docs/orchestrator_state.json.tmp docs/orchestrator_state.json
) 201>docs/.state.lock
```

Phases: `preflight` → `branch` → `plan_validate` → `implement` → `ac_gate` → `rebase` → `review` → `test` → `validate` → `merge` → `cleanup` → `docs` → `learn`

---

## Phase 0: Pre-Flight (Main)

**Phase update:** `preflight`

1. **Validate ID:** Format `^(FEAT|BUG|REFAC|TEST)-\d{3}[a-z]?$`
2. **Directory:** FEAT → `docs/backlog/features/`, BUG → `docs/backlog/bugfix/`, REFAC → `docs/backlog/refactor/`, TEST → `docs/backlog/tests/`
3. **Task file:** Glob `{dir}/{ID}_*.md`. Store absolute path as `TASK_FILE`.
4. **Check status:** "Approved" or "In Progress" allowed. "Draft" must be approved first via `/task`.
5. **Check deps:** state.json → referenced deps must be "done".
6. **Base branch:** `git rev-parse --abbrev-ref HEAD` → `BASE_BRANCH`
7. **Skill routing:** Check state.json `.{category}.{ID}.skill`, then task file `| **Skill** |` row. Store as `TASK_SKILL`.

### Skill Routing Table

```
Task skill: "canvas"  --> .claude/commands/canvas.md  (canvas/watermark/drawing)
Task skill: "pwa"     --> .claude/commands/pwa.md     (service worker, manifest, install)
Task skill: "i18n"    --> .claude/commands/i18n.md    (translations, locale)
Task skill: null      --> normal feature cycle
```

---

## Phase 1: Branch + Worktree (Main)

**Phase update:** `branch`

```bash
BRANCH_NAME="{prefix}/{ID}_{short_name}"
# prefix: feat/ for FEAT, fix/ for BUG, refac/ for REFAC, test/ for TEST
```

**If branch already exists (retry/crash recovery):**
```bash
mkdir -p .claude/worktrees
if ! git worktree list | grep -q ".claude/worktrees/{ID}"; then
    git worktree add .claude/worktrees/{ID} {BRANCH_NAME}
fi
cd .claude/worktrees/{ID}
# Use merge, NOT rebase (rebase silently drops commits if base has a revert)
git merge {BASE_BRANCH} --no-edit
```
Set `IS_RETRY = true`. Capture `EXISTING_DIFF` + `EXISTING_LOG`.

**If new:**
```bash
git branch {BRANCH_NAME} {BASE_BRANCH}
mkdir -p .claude/worktrees
git worktree add .claude/worktrees/{ID} {BRANCH_NAME}
```
Set `IS_RETRY = false`.

State: branch → `{BRANCH_NAME}`, status → "in_progress"

All subsequent phases work in: `.claude/worktrees/{ID}/`

---

## Phase 1b: Plan Validation (Sub-Agent)

**Phase update:** `plan_validate`

**On retry (IS_RETRY == true): LIGHTWEIGHT validation.**

Sub-Agent:
> Check pitfalls section is present and coherent. Verify solutions match implementation steps.
> Result (3 lines): PLAN_STATUS: valid|revised / PITFALLS_COHERENT: true|false / REVISION_SUMMARY: [1 sentence]

---

**On first attempt (IS_RETRY == false): FULL validation (8 checks).**

Sub-Agent (general-purpose):

> Working directory: {WORKTREE_PATH}
> Read task plan: `{TASK_FILE}` and `CLAUDE.md`.
>
> ## Step 1: Build Plan Inventory
> Extract ALL concrete references: file paths, function/method names + signatures,
> interface/type definitions, import paths, component props.
>
> ## Step 2: Code Reality Check (8 Checks)
> Check 1: Files & Paths — does each referenced file exist?
> Check 2: Interfaces & Signatures — do referenced functions/interfaces match?
> Check 3: Recently Merged Changes — `git log --oneline --since="$(git log -1 --format=%ci {TASK_FILE})" {BASE_BRANCH}` — overlap?
> Check 4: AC Testability — each AC concrete enough for an automated test?
> Check 5: Scope & Side Effects — circular imports? unexpected test breakage?
> Check 6: Production Readiness — error states, loading states, validation, resource cleanup?
> Check 7: Edge Cases — min. 3 edge cases documented?
> Check 8: Test Specification — public interface, expected behavior, testable preconditions?
>
> ## Step 3: Classify Findings
> INFO | MINOR | MAJOR | BLOCKER
>
> ## Step 4: Update Plan (for MINOR/MAJOR)
> Update affected sections, add Plan-Revision section with findings table.
> Git commit: `docs({ID}): revise plan -- {N} findings ({severity_summary})`
>
> Result (9 lines):
> PLAN_STATUS: valid|revised|blocked
> FINDINGS: {total} ({info} INFO, {minor} MINOR, {major} MAJOR, {blocker} BLOCKER)
> FILES_CHECKED: {count}
> CRITERIA_VALID: {valid}/{total}
> EDGE_CASES: {count} (min. 3)
> PROD_READY: {open} open / {total} checked
> TEST_SPEC: complete|added|incomplete
> REVISION_SUMMARY: [1 sentence]
> RISK: low|medium|high|blocker

| PLAN_STATUS | RISK | Action |
|-------------|------|--------|
| valid | low | Continue |
| revised | medium | Continue, store REVISION_SUMMARY |
| revised | high | Continue, findings documented |
| blocked | blocker | status → "blocked", task back to `/task` |

---

## Phase 1*: Auto-Validate Trigger (Main)

Trigger `/validate` automatically when:
- Task type is REFAC or FEAT with >3 ACs
- Plan affects >3 files
- Plan contains keywords: "refactor", "migration", "breaking", "architecture"

Skip if already validated (plan contains "Plan-Revision" or `VALIDATED == true`).

After validate: parse results, update plan for MINOR/MAJOR findings, increment `Plan-Version`, commit.

Extract `PLAN_VERSION` from task file header (default: 1).

---

## Phase 2: Implementation

**Phase update:** `implement`

### 2b: Skill Routing

**If TASK_SKILL is set:** delegate to specialist agent:
> Read and follow `{ABS_PATH}/.claude/commands/{TASK_SKILL}.md`.
> Task-ID: {ID}, Task plan: {TASK_FILE}, Working directory: {WORKTREE_PATH}.
> Execute the complete implementation according to the task plan.
> Result (5 lines): STATUS / FILES / TESTS / LINT / SUMMARY

**If TASK_SKILL is null:**

Sub-Agent (first attempt):
> Implement task {ID} in `{WORKTREE_PATH}`.
> Read task plan: {TASK_FILE}. Read CLAUDE.md for conventions.
>
> Rules:
> - Implement ALL acceptance criteria
> - Handle ALL edge cases from the plan
> - Follow CLAUDE.md conventions (TypeScript strict, Tailwind, Biome style, i18n keys)
> - Add i18n keys for ALL user-facing strings (both en.ts and de.ts)
> - Run `npm run check:fix` in worktree before committing
> - Add `Feature: {ID}` to JSDoc on new/changed exports
> - Commit: `{type}({ID}): {summary}`
>
> Result (5 lines): STATUS: done|blocked|failed / FILES: [...] / TESTS: n/a / LINT: OK|FAILED / SUMMARY

Sub-Agent (retry):
> **RETRY** of task {ID}. Read PITFALLS section first and apply all pitfalls.
> Existing work: {EXISTING_LOG} / {EXISTING_DIFF}
> Fix targeted — do NOT rewrite everything.
> Commit: `fix({ID}): address pitfalls from attempt {N}`

---

## Phase 2.5: AC-Checklist Gate (Main — inline)

After implementation, before Rebase.

1. Extract all ACs from task plan
2. Read `git diff {BASE_BRANCH}...HEAD` in worktree
3. For EACH AC: is there corresponding code in the diff?

```
AC-CHECKLIST:
AC-1: PASS — Implemented in {file}:{line}
AC-2: FAIL — Missing: {what's missing}
RESULT: {n}/{total} ACs — PASS|BLOCKED
```

Any FAIL → back to Phase 2. Each AC must be checked individually.

---

## Phase 2b: Rebase

**Phase update:** `rebase`

**On retry:** SKIP (base already integrated in Phase 1 via merge).

**On first attempt:**
```bash
cd {WORKTREE_PATH}
git fetch origin {BASE_BRANCH}
git rebase origin/{BASE_BRANCH}
```
On conflict: STATUS: blocked, recommend `/resolve {ID}`.

---

## Phase 2c: Code Review

**Phase update:** `review`

Sub-Agent:
> Read and follow `{ABS_PATH}/.claude/commands/review.md`.
> Task plan: {TASK_FILE}, Working directory: {WORKTREE_PATH}, Plan-Version: {PLAN_VERSION}.
> Result (5 lines): STATUS: pass|warn|fail / FINDINGS / CRITICAL / CONVENTIONS / SUMMARY

Review Fix Loop (max 2 iterations): if fail, fix critical findings, re-run review.
If warn: continue. Track `REVIEW_FIX_COUNT`.

---

## Phase 3: Black-Box Testing

**Phase update:** `test`

On retry: check if tests already exist. If yes, run only. If no, full /test workflow.

Sub-Agent:
> Read and follow `{ABS_PATH}/.claude/commands/test.md`.
> Task-ID: {ID}, Task plan: {TASK_FILE}, Working directory: {WORKTREE_PATH}, Plan-Version: {PLAN_VERSION}.
> Write and run black-box acceptance tests. Do NOT read implementation code.
> Result (5 lines): STATUS: pass|fail / TESTS_WRITTEN / TESTS_PASSED / EDGE_CASES / SUMMARY

Test Fix Loop (max 3 iterations): on fail, run /testfix. After 3 failures: STATUS: blocked.

---

## Phase 4: Pre-Merge Validation

**Phase update:** `validate`

Fail-fast order:
```bash
cd {WORKTREE_PATH}
npm run check && npm test && npm run build
```

### 4b: Test-Coverage Check Against Acceptance Criteria

For EACH AC: at least 1 test must check it.
AC coverage < 100% → FAIL, back to Phase 3.
Edge case coverage < 100% → WARNING (not a blocker).

### 4c: Follow-Up Queue VERIFY/high Gate

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
if [ -f "$REPO_ROOT/.build/followup_queue.json" ]; then
  VERIFY_HIGH=$(jq '[.items[] | select(.category == "VERIFY" and .priority == "high")] | length' "$REPO_ROOT/.build/followup_queue.json")
  if [ "$VERIFY_HIGH" -gt 0 ]; then
    echo "BLOCKED: $VERIFY_HIGH VERIFY/high items in Follow-Up Queue"
  fi
fi
```

---

## Phase 5: Merge

**Phase update:** `merge`

```bash
cd {ABS_PATH}   # Back to main repo
git merge --no-ff {BRANCH_NAME} -m "merge({ID}): {title}"
```

State: merged → true

### 5b: Worktree Cleanup

```bash
git worktree remove .claude/worktrees/{ID}
```

**On failure/blocked (no merge):**
```bash
git worktree remove --force .claude/worktrees/{ID}
# Branch kept for debugging/retry
```

---

## Phase 6: Documentation + Follow-Up

**Phase update:** `docs`

1. state.json: status → "done", phase → null
2. Task file: set status to "Done"
3. `git commit -m "docs({ID}): mark task done"`

Present Follow-Up Queue items for triage (Execute/Backlog/Dismiss).

---

## Phase 7: Learning

**Phase update:** `learn`

Sub-Agent:
> Read and follow `{ABS_PATH}/.claude/commands/learn.md`.
> Task-ID: {ID}, Task plan: {TASK_FILE}, Review result: {REVIEW_RESULT},
> Review fix count: {REVIEW_FIX_COUNT}, Test result: {TEST_RESULT},
> Test fix count: {TEST_FIX_COUNT}, IS_RETRY: {IS_RETRY}.

---

## Follow-Up Queue

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
mkdir -p "$REPO_ROOT/.build/"
QUEUE_FILE="$REPO_ROOT/.build/followup_queue.json"
```

Queue format:
```json
{
  "source_task": "{ID}",
  "items": [
    {
      "id": "FQ-001",
      "category": "VERIFY|REFAC|IDEA",
      "source_agent": "execute-task|review|test|testfix|validate",
      "source_phase": "2|2.5|2c|3|4",
      "title": "{short title}",
      "description": "{description}",
      "affected_files": ["src/lib/watermark.ts"],
      "priority": "high|medium|low",
      "auto_testable": true
    }
  ]
}
```

Rules: append-only, max 10 entries per run, VERIFY/high blocks pre-merge.

---

## Result Format

```
STATUS: done|blocked|failed
MERGED: true|false
TESTS: {new} new, {total} total, {passed} passed, {failed} failed
LINT: OK|FAILED ({N} errors)
SUMMARY: [1 sentence]
```

## Rules

1. EVERY phase transition updates state.json
2. ALL work happens in the worktree, NEVER on the base branch
3. Sub-agent results: structured, max 5 lines
4. **NO `git checkout` in the main agent**
5. Implementation and testing are SEPARATED (different agents)
6. Run `npm run check:fix` before every commit (Biome)

## Learnings

*(Agents append learnings here after tasks)*
