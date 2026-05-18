# /bootstrap — Project Onboarding

**Arguments:** $ARGUMENTS (mode: empty=full | skills-only | docs-only | refresh)

Scans the existing codebase, detects frameworks/domains, and auto-generates skills + documentation. Always shows a plan and waits for approval before generating.

---

## Phase 1: Scout (Sub-Agent)

Sub-Agent (Explore):
> Analyze `/Users/rex-fab-alt/Documents/code/playground/mark-your-picture`.
>
> Detect:
> 1. All source directories + purpose
> 2. Frameworks + versions (from package.json)
> 3. Existing `.claude/commands/` files (what already exists)
> 4. Test setup (Vitest config, Playwright config, test patterns)
> 5. Build pipeline (vite.config.ts, CI workflows in .github/)
> 6. Code patterns: how components are structured, how lib functions work, how i18n is used
> 7. Existing CLAUDE.md and README.md
>
> Report: concise technical summary, 10-15 lines. List all existing agent commands found.

---

## Phase 2: Propose (Human Checkpoint)

Based on scout results, propose:

```
=== BOOTSTRAP PROPOSAL ===

NEW SKILLS TO CREATE:
  [ ] canvas.md — canvas/watermark/drawing specialist
  [ ] pwa.md — service worker/manifest/install specialist
  [ ] i18n.md — translation/locale specialist

DOCS TO CREATE/UPDATE:
  [ ] CLAUDE.md — already exists, review for gaps
  [ ] docs/ARCHITECTURE.md — describe component/context/lib architecture
  [ ] .claude/commands/README.md — already exists

MODE: {mode}

Proceed? (edit the list if needed, then confirm)
```

**Wait for user approval before Phase 3.**

---

## Phase 3: Generate (Parallel Sub-Agents)

Launch up to 5 parallel sub-agents for approved items:

### canvas.md specialist

> Create `.claude/commands/canvas.md` — specialist for canvas/watermark tasks.
> Analyze `src/lib/watermark.ts` and `src/components/tool/WatermarkCanvas.tsx`.
> Include:
> - Key functions and their signatures
> - Canvas API patterns used in this project
> - Common pitfalls (CORS, taint, object URL lifecycle)
> - Testing patterns for canvas operations
> Keep it thin (20-40 lines). Only document patterns actually in the code.

### pwa.md specialist

> Create `.claude/commands/pwa.md` — specialist for PWA tasks.
> Analyze `vite.config.ts` (vite-plugin-pwa config) and `public/` manifest.
> Include:
> - Plugin configuration patterns
> - How to add new cached routes
> - Icon regeneration (scripts/generate-icons.mjs)
> - Install prompt component (src/components/ui/InstallBanner.tsx)
> Keep it thin (20-40 lines).

### i18n.md specialist

> Create `.claude/commands/i18n.md` — specialist for translation tasks.
> Analyze `src/i18n/index.tsx`, `src/i18n/locales/en.ts`, `src/i18n/locales/de.ts`.
> Include:
> - How to add new translation keys
> - How the i18n hook is used in components
> - Testing i18n (src/test/i18n.test.tsx patterns)
> Keep it thin (20-40 lines).

### ARCHITECTURE.md

> Create `docs/ARCHITECTURE.md`.
> Based on the codebase, describe:
> - Component hierarchy and data flow
> - Context API usage (WatermarkContext, ThemeContext)
> - Core lib functions (watermark.ts, batch.ts) and their relationship to UI
> - How routing works (React Router 7)
> - How the PWA works (vite-plugin-pwa, service worker)
> - Test coverage map (which files have tests)
> 1-2 pages max, use diagrams where helpful.

---

## Phase 4: Consistency Check

After all sub-agents complete:
- Verify generated files reference real files/functions (no hallucination)
- Check that CLAUDE.md skill routing table matches created specialists
- Commit: `docs: bootstrap agent system -- add specialists + architecture docs`

---

## Report

```
=== BOOTSTRAP COMPLETE ===
CREATED: {list of files}
UPDATED: {list of files}
SKILLS: {n} specialists ready
NEXT STEPS:
  1. Review generated files
  2. Add tasks: /task <description>
  3. Run pipeline: /orchestrator
```
