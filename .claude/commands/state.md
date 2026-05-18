# /state — Project Status (Read-Only)

**Arguments:** $ARGUMENTS (optional: task ID for detail view, e.g. "FEAT-003")

Shows current project state from `docs/orchestrator_state.json`. Never modifies anything.

---

## Phase 1: Read State

```bash
cat docs/orchestrator_state.json
```

---

## Phase 2: Present Status

### Overview

```
=== mark-your-picture PROJECT STATE ===
Orchestrator: {status} (phase: {phase})
Base branch: {base_branch}

FEATURES:
  done ({n}):      {IDs}
  approved ({n}):  {IDs}
  in_progress ({n}): {IDs}
  blocked ({n}):   {IDs}
  skipped ({n}):   {IDs}
  draft ({n}):     {IDs}

BUGFIXES: (same breakdown)
REFACTORS: (same breakdown)
TESTS: (same breakdown)

QUEUE: {[ordered list of IDs]}
ACTIVE: {[IDs currently being worked on]}

ERRORS: {n} tasks with errors
```

### If a task ID is given in arguments

Show detailed view for that task:
```
=== {ID}: {title} ===
Status: {status}
Phase: {phase}
Branch: {branch}
Merged: {merged}
Skill: {skill}
Deps: {deps}
Plan: {plan_file}

Attempts:
  {attempt_history from errors[]}

Recent history:
  {last 3 history entries}
```

### Follow-Up Queue

If `.build/followup_queue.json` exists:
```bash
cat .build/followup_queue.json 2>/dev/null
```
Show count and any VERIFY/high items.

---

## Useful Next Actions

Based on state, suggest:
- If queue is empty and tasks in draft: "Approve tasks by setting status to 'approved' in docs/orchestrator_state.json, then run /orchestrator"
- If queue has approved tasks: "Run `/orchestrator` to process {n} approved tasks"
- If tasks are blocked: "Run `/validate {ID}` to diagnose blocked task"
- If errors exist: "Review error in state.json and consider `/execute-task {ID}` for retry"
