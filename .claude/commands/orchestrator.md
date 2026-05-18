# /orchestrator — Autonomous Task Pipeline

**Arguments:** $ARGUMENTS
(e.g. "only FEAT-003", "from REFAC-002", or empty for full queue)

## Principles

1. Full autonomy — no user intervention, queue is processed completely
2. Self-healing — 3 attempts per problem, then skip + document
3. Resume-capable — `docs/orchestrator_state.json` is the runtime database
4. **Delegation** — task execution via `/execute-task` (no duplicated code)
5. **Lean main context** — Main = queue manager, `/execute-task` = worker
6. **Branch isolation** — each task on its own branch (managed by /execute-task)
7. **Sequential execution** — always 1 task at a time, no parallelism

---

## Architecture

```
/orchestrator (Main = Queue Manager)
  |
  |-- Phase 0: Init / Resume
  |-- Phase 1: Queue Build (Sub-Agent)
  |
  |-- Phase 2: Task Execution (Loop over queue)
  |     |
  |     |-- 2.1: Take task from queue
  |     |-- 2.2: Run /execute-task as Sub-Agent  <-- DELEGATION
  |     |       (Branch, Worktree, Impl, Test, Learn, Merge)
  |     |-- 2.3: Process result + validation + retries
  |     |-- 2.4: Deps check (unblocked tasks)
  |     +-- 2.5: Post-merge validation (full test suite on base branch)
  |
  +-- Phase 3: Completion (consistency check, report)
```

---

## Context Rules

| Rule | Details |
|------|---------|
| Main reads | ONLY `docs/orchestrator_state.json` + `.build/followup_queue.json` |
| Sub-agent prompts | Max 10 lines with all required paths |
| Sub-agent results | Max 5 lines: STATUS + MERGED + TESTS + LINT + SUMMARY |
| state.json updates | Main: queue/active/history. /execute-task: phase/status/branch/merged |
| .build/ | Runtime artifacts (Follow-Up Queue). Gitignored. Lives in repo root |

---

## State Schema

`docs/orchestrator_state.json`

```
features.{ID}.status: "backlog"|"approved"|"in_progress"|"done"|"blocked"|"skipped"
features.{ID}.plan: "docs/backlog/features/FEAT-XXX_name.md"
features.{ID}.deps: ["FEAT-XXX", ...]
features.{ID}.branch: null | "feat/FEAT-XXX_name"
features.{ID}.merged: false | true
features.{ID}.skill: null | "canvas"|"pwa"|"i18n"
orchestrator.status: "idle"|"running"|"paused"|"completed"|"error"
orchestrator.phase: null|"init"|"executing"|"docs_check"|"completed"
orchestrator.base_branch: "main"
queue: [IDs]
active: [IDs]
history: [{id, result, timestamp}]
errors: [{id, phase, error, category, attempts: [{attempt, phase, error, timestamp}]}]
```

---

## Phase 0: Init / Resume

Read `docs/orchestrator_state.json`.

- **running**: RESUME. Active tasks without "done" back to queue. Done tasks out of queue.
- **paused**: Check blockers. Resolved → continue. Done tasks out of queue.
- **idle/completed**: Fresh start → Phase 1.
- **error**: Recovery. "done" → history. Rest → queue. Done tasks out of queue.

**Queue Hygiene (on EVERY start/resume):**
Filter queue: only tasks with status "approved" or "in_progress" remain.
Remove tasks with "done", "draft", "skipped".

State: status → "running", base_branch → "main".

---

## Phase 1: Queue Build (Sub-Agent)

Sub-Agent (Explore):

> Read `{ABS_PATH}/docs/orchestrator_state.json`.
> Topological sort: tasks without open deps first.
> Filter: {ARGUMENTS if provided}. Include tasks with status "approved" or "in_progress".
> Sequential order: respect dependencies, one task at a time.
> Result (ONLY 1 line):
> QUEUE: [FEAT-001, BUG-003, ...]

Main: write queue + phase "executing" to state.json.

---

## Phase 2: Task Execution (Loop)

### 2.1 Prepare Task (Main)
Take task ID from queue, move to `active`, status → "in_progress".

### 2.2 Delegate to /execute-task (Sub-Agent)

> Read and follow `{ABS_PATH}/.claude/commands/execute-task.md`.
> Task-ID: {ID}
> Working directory: {ABS_PATH}
> `cd {ABS_PATH}` as first bash command.
> Execute the COMPLETE /execute-task workflow (pre-flight through Phase 7).
>
> Result (ONLY 5 lines):
> STATUS: done|blocked|failed
> MERGED: true|false
> TESTS: {new} new, {total} total, {passed} passed, {failed} failed
> LINT: OK|FAILED ({N} errors)
> SUMMARY: [1 sentence]

### 2.3 Process Result (Main)

**Validation:**
1. STATUS != "done" → blocked/failed handling
2. TESTS: `{failed} > 0` → rejected
3. LINT: "FAILED" → rejected
4. TESTS: `{new} < 1` → rejected (exception: REFAC/docs tasks)

**On success:** active → history with `{id, result: "done", timestamp}`
**On failure:** → Phase 2.3b (fix analysis)

### 2.3b Fix Analysis (Sub-Agent)

Triggered when /execute-task returns STATUS blocked/failed or post-merge validation fails.

**Prerequisite:** `attempts.length < 2` (max 3 total attempts).

Sub-Agent (general-purpose):
> Analyze failure of task {ID}. Update plan with pitfalls.
> Context: task plan {TASK_FILE}, phase {PHASE}, error {ERROR}, attempts {ATTEMPTS_JSON}.
> Classify: fixable (clear root cause) | structural (design error).
> For fixable: add ## Pitfalls table to plan, adjust impl steps, commit.
> Result (4 lines):
> CATEGORY: fixable|structural
> ROOT_CAUSE: [1 sentence]
> PITFALLS_ADDED: {count}
> PLAN_UPDATED: true|false

| CATEGORY | Action |
|----------|--------|
| `fixable` | re-enqueue at position 0, status → "in_progress", keep branch |
| `structural` | status → "skipped", keep branch for manual analysis |

### 2.4 Deps Check
Move unblocked tasks (all deps "done") into queue.

### 2.5 Post-Merge Validation

After EVERY successful merge. Fail-fast order:

```bash
cd {ABS_PATH}
npm run check && npm test && npm run build
```

- **OK** → next task
- **FAILED** → revert + fix analysis:
  1. `git log -1 --format="%H %s" --merges`
  2. `git revert -m 1 {MERGE_COMMIT_HASH} --no-edit`
  3. state.json: merged → false
  4. → Phase 2.3b

---

## Phase 3: Completion

Sub-Agent: final consistency check for state.json.
Main: status → "completed".

### 3a: Task Report

```
=== ORCHESTRATOR REPORT ===
DONE: {n} tasks
SKIPPED: {n} tasks (IDs + reason)
BLOCKED: {n} tasks (IDs + blocker)
UNMERGED BRANCHES: {list or "none"}
```

### 3b: Follow-Up Summary

Read `.build/followup_queue.json`. Present grouped by category:

```
=== FOLLOW-UP SUMMARY ===
VERIFY ({n}): ...
REFAC ({n}): ...
IDEA ({n}): ...
```

---

## Error Handling

| Level | Description |
|-------|-------------|
| 1 | /execute-task fixes inline (bug-fix loop in review/test phases) |
| 1b | Main checks TESTS/LINT fields |
| 2 | Fix analysis agent: classify, update plan + pitfalls |
| 2b | fixable: re-enqueue, max 3 total attempts |
| 2c | structural: immediate skip |
| 3 | After 3 attempts: skip + document |
| 4 | Post-merge validation FAILED → revert → fix analysis |
| Critical | >50% blocked → pause, output report |

---

## RULES

- Main = queue manager. /execute-task = task worker. Strict separation.
- **NO `git checkout` in the main agent** — Main ALWAYS stays on the base branch
- Results: structured, max 5 lines, no prose
- Fully autonomous — process queue completely
- On >50% blocked: output report and pause

## Learnings

*(Agents append learnings here after tasks)*
