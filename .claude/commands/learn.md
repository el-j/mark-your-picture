# /learn — Post-Task Learning

**Arguments:** Task ID + task plan + review/test results (called by /execute-task Phase 7)

Extracts concrete insights from task execution and writes them into the relevant agent MD files as learnings. This is how the agent system self-evolves.

---

## Phase 1: Gather Evidence

Read all inputs:
- Task plan (ACs, edge cases, pitfalls if present)
- Review result (findings, conventions violations)
- Test result (what passed/failed, iterations needed)
- Review fix count (0 = clean, 1-2 = had issues)
- Test fix count (0 = clean, 1-3 = had issues)
- IS_RETRY + attempt number
- Attempt history (what went wrong in previous attempts)

---

## Phase 2: Extract Insights

For each significant event, ask: "What would have prevented this?" or "What made this work well?"

### High-value learning triggers:
- Review fix count > 0 → what convention was missed?
- Test fix count > 0 → CODE_BUG or TEST_BUG? What caused it?
- IS_RETRY == true → what was the root cause of the previous failure?
- Pitfalls were present → did they help? Were they correct?
- DESIGN_ISSUE found in testfix → what abstraction is missing?
- AC was not implemented until AC-gate caught it → which AC pattern is hard to see?

### Do NOT write learnings about:
- One-off project-specific details (e.g. "FEAT-001 needed X")
- Things already obvious from CLAUDE.md
- Git history or commit details

---

## Phase 3: Write Learnings

For each insight, decide which agent file to update:

| Pattern | Target file |
|---------|------------|
| Implementation convention missed | `.claude/commands/execute-task.md` |
| Review finding that recurs | `.claude/commands/review.md` |
| Test pattern that works well | `.claude/commands/test.md` |
| Test failure pattern | `.claude/commands/testfix.md` |
| Plan validation miss | `.claude/commands/validate.md` |
| Task planning gap | `.claude/commands/task.md` |
| Orchestrator workflow issue | `.claude/commands/orchestrator.md` |
| Project-specific canvas patterns | `.claude/commands/canvas.md` (if exists) |

**Format for each learning:**
```markdown
- {Concrete, actionable insight in 1-2 sentences}. ({source: what triggered this})
```

Append under the `## Learnings` section of the target file.

---

## Phase 4: Update README Learnings

If a learning is broadly applicable (not task-specific), also append to `.claude/commands/README.md` under `## Learnings`.

---

## Phase 5: Commit

```bash
cd {ABS_PATH}
git add .claude/commands/
git commit -m "docs({ID}): add learnings from task execution"
```

---

## Result

```
LEARNINGS_WRITTEN: {n} total ({n1} execute-task, {n2} review, {n3} test, ...)
TARGET_FILES: [list of updated agent files]
SUMMARY: [1 sentence on the most important insight]
```

## Learnings

*(Agents append learnings here after tasks)*
