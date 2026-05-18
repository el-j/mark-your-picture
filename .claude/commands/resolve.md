# /resolve — Merge Conflict Resolution

**Arguments:** $ARGUMENTS (task ID, e.g. FEAT-003)

Resolves merge conflicts on a task branch. Called when /execute-task or /orchestrator reports a merge conflict.

---

## Phase 1: Locate Branch

```bash
# Read state.json to find branch name
BRANCH=$(jq -r '.features["{ID}"].branch // .bugfixes["{ID}"].branch // .refactors["{ID}"].branch' docs/orchestrator_state.json)

# Check if worktree exists
git worktree list | grep ".claude/worktrees/{ID}"
```

If worktree is gone:
```bash
mkdir -p .claude/worktrees
git worktree add .claude/worktrees/{ID} {BRANCH}
```

---

## Phase 2: Identify Conflicts

```bash
cd .claude/worktrees/{ID}
git status | grep "both modified\|deleted by\|added by"
git diff --name-only --diff-filter=U
```

---

## Phase 3: Resolve Conflicts

For each conflicted file:
1. Read the full conflict markers (`<<<<<<`, `=======`, `>>>>>>>`)
2. Understand BOTH sides — our changes (task branch) and theirs (main)
3. Read the task plan to understand the intent
4. Resolve: keep ours, keep theirs, or merge both

**Resolution rules:**
- Never silently drop our task's changes
- If theirs is a new feature that coexists: merge both
- If theirs changes an interface we depend on: update our usage
- If conflict is in generated files (e.g. package-lock.json): prefer theirs, re-apply our dep changes
- If conflict is in i18n files (en.ts/de.ts): merge both sets of keys

---

## Phase 4: Verify Resolution

```bash
cd .claude/worktrees/{ID}
git add .
npm run check && npm test && npm run build
```

If tests fail after resolution: diagnose and fix (the merge may have introduced incompatibilities).

---

## Phase 5: Complete Merge

```bash
cd .claude/worktrees/{ID}
git commit -m "resolve({ID}): merge conflict with {BASE_BRANCH}"
```

Then update state.json: phase → "review" (continue from where /execute-task left off).

---

## Phase 6: Resume /execute-task

Report back which phase was interrupted. User can re-run `/execute-task {ID}` to continue.

```
CONFLICT_RESOLVED: true
FILES_RESOLVED: {n}
RESUME_AT_PHASE: review
NEXT_COMMAND: /execute-task {ID}
```
