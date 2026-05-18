# CLAUDE.md — mark-your-picture

Single source of truth for AI assistants working on this codebase.

## Project Overview

**mark-your-picture** is a client-side PWA that lets users add text or image watermarks to photos (single or batch) and download the result. All processing happens in the browser — no server involved.

**Tech stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Router 7, Vitest 4, Playwright 1.59, Biome 2, vite-plugin-pwa, JSZip, semantic-release.

## Repository Structure

```
mark-your-picture/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, ThemeToggle, DesktopNav, MobileMenu
│   │   ├── pages/           # AboutPage, ImprintPage
│   │   ├── tool/            # Watermark editor UI (Canvas, DropZone, Sidebar, Panels…)
│   │   └── ui/              # BottomSheet, InstallBanner, Toast
│   ├── contexts/            # WatermarkContext, ThemeContext
│   ├── hooks/               # useToast
│   ├── i18n/                # en.ts, de.ts + index.tsx
│   ├── lib/                 # watermark.ts, batch.ts, types.ts (core logic)
│   └── test/                # Vitest setup + unit tests
├── e2e/                     # Playwright tests (app, tool, visual)
├── public/                  # PWA icons, manifest, ads.txt
├── docs/
│   ├── backlog/
│   │   ├── features/        # FEAT-XXX_*.md
│   │   ├── bugfix/          # BUG-XXX_*.md
│   │   ├── refactor/        # REFAC-XXX_*.md
│   │   └── tests/           # TEST-XXX_*.md
│   └── orchestrator_state.json
├── templates/               # Task plan templates (feature, bugfix, refactor…)
├── .claude/
│   ├── commands/            # Agent system (12 core agents)
│   └── worktrees/           # Git worktrees (per-task isolation)
├── .build/                  # Runtime artifacts — gitignored
│   └── followup_queue.json  # Follow-up queue written by agents
└── scripts/                 # generate-icons.mjs
```

## Development Commands

```bash
npm run dev            # Start Vite dev server (localhost:5173)
npm run build          # tsc + vite build -> dist/
npm run preview        # Serve dist/ for E2E (localhost:4173)
npm test               # Vitest unit tests (run once)
npm run test:watch     # Vitest watch mode
npm run test:coverage  # Vitest with v8 coverage
npm run e2e            # Playwright E2E tests
npm run e2e:update     # Update visual snapshots
npm run check          # Biome lint + format check (use before commit)
npm run check:fix      # Biome auto-fix
npm run lint           # Biome lint only
npm run format:write   # Biome format only
npm run generate-icons # Regenerate PWA icons via sharp
```

## Code Conventions

### Language & Style
- TypeScript strict mode. No `any` unless justified.
- Functional React components with hooks. No class components.
- Tailwind utility classes for all styling — no inline `style={}` unless canvas/dynamic.
- Biome enforces formatting (2-space indent, double quotes). Run `npm run check:fix` before committing.
- No comments by default. Add one only when the WHY is non-obvious.

### i18n
- All user-facing strings go through `src/i18n/`. Add keys to both `en.ts` and `de.ts`.
- Never hardcode English strings in JSX.

### State Management
- `WatermarkContext` owns watermark config. `ThemeContext` owns dark/light.
- Prefer context + hooks over prop drilling. No Redux or Zustand.

### Core Logic
- Canvas watermarking lives in `src/lib/watermark.ts`.
- Batch processing lives in `src/lib/batch.ts`.
- Keep `lib/` pure (no React). Components call lib functions.

### Documentation Standard
Every exported function/component gets a structured JSDoc when the WHY is non-trivial:
```ts
/**
 * Purpose: What it does.
 * Usage: Where/how it's used.
 * Rationale: Why this approach was chosen.
 * Feature: FEAT-XXX, BUG-XXX
 */
```
The `Feature:` line links code to its originating task — creating long-term traceability:
- **Creating** new code: add current task ID.
- **Modifying** existing code: append current task ID to existing list.
- **Legacy code** without a Feature line: backfill from git history or mark `Feature: pre-tracking`.

### Commit Format
```
feat(scope): summary
fix(scope): summary
refactor(scope): summary
docs(scope): summary
test(scope): summary
chore(scope): summary

Co-Authored-By: Claude <noreply@anthropic.com>
```
Follows Conventional Commits (required by semantic-release).

## Testing

### Unit Tests (Vitest)
- Files: `src/test/*.test.ts(x)`.
- Setup: `src/test/setup.ts` (jsdom + @testing-library/jest-dom).
- Run: `npm test`.
- Tests use `@testing-library/react` for component tests and plain Vitest for lib functions.
- Coverage: `npm run test:coverage` (v8 provider).

### E2E Tests (Playwright)
- Files: `e2e/*.spec.ts`.
- Targets Chromium only. Base URL: `http://localhost:4173/mark-your-picture/`.
- Run: `npm run e2e` (auto-starts `npm run preview`).
- Visual regression snapshots committed in `e2e/visual.spec.ts-snapshots/`.
- Update snapshots: `npm run e2e:update`.

### Quality Gates (all must pass before merge)
1. `npm run check` — Biome lint + format
2. `npm test` — all Vitest unit tests pass
3. `npm run build` — TypeScript + Vite build succeeds
4. `npm run e2e` — all Playwright tests pass

## Agent System

The project uses the claude-agent-blueprint pipeline.
See `.claude/commands/README.md` for full documentation.

### Agent Commands (12 core)

| Command | Purpose |
|---------|---------|
| `/bootstrap` | Project onboarding: scan, generate skills + docs |
| `/orchestrator` | Autonomous task pipeline (queue manager) |
| `/execute-task` | Task worker: branch → implement → review → test → learn → merge |
| `/task` | Task planning with acceptance criteria, edge cases, test spec |
| `/validate` | Deep plan validation against codebase |
| `/state` | Show project status (read-only) |
| `/resolve` | Merge conflict resolution |
| `/review` | White-box code review (plan-version check) |
| `/test` | Black-box acceptance tests (never sees implementation) |
| `/testfix` | Intelligent test failure analysis (fix code or fix test) |
| `/learn` | Post-task learning → writes learnings into agent MDs |
| `/simplify` | Review changed code for reuse, quality, efficiency |

### Skill Routing

| Skill | Specialist | Trigger Keywords |
|-------|-----------|-----------------|
| `canvas` | `/canvas` | canvas, watermark, draw, ImageData, OffscreenCanvas |
| `pwa` | `/pwa` | service worker, manifest, install, offline, PWA |
| `i18n` | `/i18n` | translation, locale, i18n, language, de.ts, en.ts |

### Task Pipeline

```
/task → /execute-task → /review → /test → /testfix → /learn
         ↓                ↓          ↓          ↓
      branch+worktree  white-box  black-box  fix code
      skill routing    AC check   plan-only  or test
      7 quality gates  no AC mod  no impl    learnings
```

### Quality Gates (7)

| Gate | Phase | What it checks |
|------|-------|---------------|
| Plan Validation | 1b | 8-check suite against codebase |
| Auto-Validate | 1* | Deep validation for complex tasks |
| AC-Checklist Gate | 2.5 | Every AC has corresponding code |
| White-Box Review | 2c | Code quality, conventions, plan-version |
| Black-Box Tests | 3 | Independent tests from plan only |
| Test-Coverage Check | 4b | Each AC mapped to at least one test |
| Follow-Up Queue Gate | 4c | VERIFY/high items block merge |

### Runtime Artifacts

- `.build/followup_queue.json` — agents write out-of-scope findings here (gitignored)
- `.claude/worktrees/{ID}` — per-task git worktrees (gitignored)

## General Behavior

- **Language:** English for code, comments, and commit messages.
- **Ambiguity:** State ambiguity and ask clarifying questions before implementing.
- **Scope:** Never add features beyond what the task plan specifies.
- **Security:** No XSS, no eval, no innerHTML with user content. Canvas API is safe.
- **PWA:** All new UI strings need i18n keys. Icons must be regenerated after changes.
