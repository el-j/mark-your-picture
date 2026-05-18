# /task — Task Planning

**Arguments:** $ARGUMENTS (task description, e.g. "Add resize handle to canvas area")

Creates a structured task plan in the backlog with acceptance criteria, edge cases, public interface definition, and a test specification for the black-box agent.

---

## Phase 1: Classify & Assign ID

1. **Classify type:**
   - `FEAT` — new feature or user-visible capability
   - `BUG` — bug fix
   - `REFAC` — internal refactoring (no behavior change)
   - `TEST` — test coverage improvement

2. **Assign ID:** Read `docs/orchestrator_state.json`. Find the highest existing ID of that type. Increment by 1. Format: `FEAT-001`, `BUG-003`, etc.

3. **Identify skill:** Does this task match a specialist?
   - `canvas` — canvas drawing, watermark rendering, ImageData, OffscreenCanvas, image export
   - `pwa` — service worker, manifest, install prompt, offline support
   - `i18n` — translation keys, locale files, language switching
   - `null` — general React/TypeScript feature

4. **Identify dependencies:** Does this task require other tasks to be done first?

---

## Phase 2: Codebase Analysis (Sub-Agent)

Sub-Agent (Explore):
> Analyze the codebase at `/Users/rex-fab-alt/Documents/code/playground/mark-your-picture` to understand the context for task: "{TASK_DESCRIPTION}".
>
> Find:
> 1. Relevant existing files (components, hooks, lib functions, contexts, i18n keys)
> 2. Existing interfaces/types in `src/lib/types.ts` that the task touches
> 3. Related test files in `src/test/` and `e2e/`
> 4. Any existing patterns the task should follow
>
> Report: file paths, relevant function signatures, existing types, test patterns. 5-10 lines max.

---

## Phase 3: Draft Task Plan

Choose template based on type:
- FEAT → `templates/feature.md`
- BUG → `templates/bugfix.md`
- REFAC → `templates/refactor.md`
- TEST → `templates/feature.md` (adapted)

Fill in the template with:

### Required Sections

**Acceptance Criteria:** 3–7 testable, specific conditions. Each must be:
- Verifiable by an automated test
- Specific (not "it should work" but "given X, when Y, then Z")
- Focused on behavior, not implementation

**Edge Cases:** Min. 3. Consider:
- Empty/null inputs (no image loaded, empty text watermark)
- Boundary values (0% opacity, 100% scale, max font size)
- Concurrent operations (batch processing + UI interaction)
- Browser/device differences (mobile touch vs desktop mouse)
- PWA state (offline, install prompt dismissed)
- i18n edge cases (very long translations, RTL languages)

**Public Interface:** What gets exported/exposed? Function signatures, component props, context values.

**Test Specification (for black-box agent):**
- What can be tested from the outside (no implementation knowledge)
- Which Vitest/Playwright APIs to use
- Specific assertions for each AC
- Which fixtures/mock data to use (`e2e/fixtures/`)

**Affected Files:** List all files that will be created or modified.

**Skill:** Specialist to use (canvas | pwa | i18n | null).

---

## Phase 4: Validate Draft

Before saving, verify:
- [ ] Each AC is independently testable
- [ ] Min. 3 edge cases
- [ ] Public interface is complete
- [ ] Test spec covers all ACs
- [ ] All user-facing strings mention i18n key requirement
- [ ] Affected files list is realistic

---

## Phase 5: Save & Register

1. Save task plan to:
   - FEAT → `docs/backlog/features/{ID}_{short_name}.md`
   - BUG → `docs/backlog/bugfix/{ID}_{short_name}.md`
   - REFAC → `docs/backlog/refactor/{ID}_{short_name}.md`
   - TEST → `docs/backlog/tests/{ID}_{short_name}.md`

2. Register in `docs/orchestrator_state.json`:
   ```json
   "{ID}": {
     "title": "{description}",
     "status": "draft",
     "deps": [],
     "plan": "docs/backlog/{type}/{filename}.md",
     "branch": null,
     "merged": false,
     "skill": "{skill or null}"
   }
   ```
   Add to the correct category: `features`, `bugfixes`, `refactors`, or `tests`.

3. Commit: `docs({ID}): add task plan -- {title}`

---

## Phase 6: Present & Approve

Show the user:
1. Task ID and title
2. Summary of acceptance criteria (3–7 items)
3. Edge cases count
4. Skill routing
5. Dependencies

Ask: "Review the plan at `docs/backlog/.../{ID}_*.md`. Set status to 'approved' in `docs/orchestrator_state.json` when ready, then run `/execute-task {ID}` or `/orchestrator`."

---

## Rules

- Task plans are immutable once approved (only /execute-task may revise them via Plan-Revision)
- ACs must be testable by a black-box agent that never sees the implementation
- Never include implementation details in ACs (no "use useState", "call watermark.ts")
- Always reference CLAUDE.md conventions in the implementation steps
- i18n: every task that adds UI strings must include AC for both en.ts and de.ts

## Learnings

*(Agents append learnings here after tasks)*
