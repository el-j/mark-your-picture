# Agent System — mark-your-picture

This project uses the [claude-agent-blueprint](https://github.com/mongoistkeingemuese/claude-agent-blueprint) pipeline, adapted for a React/TypeScript/Vite stack.

## Commands

| Command | Purpose |
|---------|---------|
| `/bootstrap` | Onboard the project: scan codebase, generate skills + docs |
| `/task` | Plan a task with acceptance criteria, edge cases, test spec |
| `/validate` | Deep plan validation against the codebase |
| `/execute-task` | Run a single task: branch → implement → review → test → learn → merge |
| `/orchestrator` | Autonomous mode: process the full backlog queue |
| `/review` | White-box code review against a task plan |
| `/test` | Black-box acceptance tests (reads plan only, not code) |
| `/testfix` | Analyze test failures: fix code or fix test |
| `/learn` | Write insights back into agent MDs (self-evolution) |
| `/state` | Show project status (read-only) |
| `/resolve` | Merge conflict resolution |

## Quick Start

1. **Plan a task:** `/task Add resize handle to canvas area`
2. **Execute it:** `/execute-task FEAT-001`
3. **Run all approved tasks:** `/orchestrator`

## Architecture

```
/orchestrator (Queue Manager)
     |
     └── /execute-task (Task Worker per task)
               |
               ├── Phase 0: Pre-flight (validate ID, deps, skill routing)
               ├── Phase 1: Branch + Worktree
               ├── Phase 1b: Plan Validation (8-check suite)
               ├── Phase 1*: Auto-Validate (heuristic trigger)
               ├── Phase 2: Implementation (or skill delegation)
               ├── Phase 2.5: AC-Checklist Gate
               ├── Phase 2b: Rebase
               ├── Phase 2c: /review (white-box)
               ├── Phase 3: /test (black-box)
               ├── Phase 3b: /testfix (failure loop, max 3)
               ├── Phase 4: Pre-Merge Validation
               ├── Phase 5: Merge + Worktree cleanup
               ├── Phase 6: Docs Update + Follow-Up Queue triage
               └── Phase 7: /learn
```

## State File

`docs/orchestrator_state.json` is the runtime database. Edit it to add/approve tasks.
Status values: `draft` → `approved` → `in_progress` → `done` | `blocked` | `skipped`

## Follow-Up Queue

`.build/followup_queue.json` (gitignored) — agents write out-of-scope findings here.
Categories: `VERIFY` (side effects), `REFAC` (cleanup), `IDEA` (future features).
`VERIFY/high` items block pre-merge.

## Project Stack (for context)

- React 19, TypeScript 6, Vite 8, Tailwind CSS 4
- Vitest 4 (unit), Playwright 1.59 (E2E)
- Biome 2 (lint + format)
- vite-plugin-pwa, JSZip, React Router 7
- Semantic Release (automated versioning)

## Learnings

*(Agents append learnings here after tasks)*
