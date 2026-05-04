# Contributing to Mark Your Picture

Thank you for your interest in contributing! Here's how you can help.

## Reporting Bugs

Please open a [GitHub Issue](https://github.com/el-j/mark-your-picture/issues) with:
- A clear title and description
- Steps to reproduce the problem
- Expected vs. actual behaviour
- Browser/OS version

## Suggesting Features

Open a [GitHub Issue](https://github.com/el-j/mark-your-picture/issues) with the `enhancement` label. Describe the feature, the use case, and any implementation ideas you have.

## Pull Request Process

1. **Fork** the repository and create a feature branch: `git checkout -b feat/my-feature`
2. **Make your changes** — see code style notes below
3. **Test** — run `npm run build` to ensure there are no TypeScript or build errors
4. **Commit** with a clear message, e.g. `feat: add rotation preset buttons`
5. **Open a PR** against `main` and fill in the PR description

PRs that break the build or introduce TypeScript errors will not be merged.

## Code Style

- **TypeScript strict** — no `any`, enable strict checks
- **Tailwind CSS** — use Tailwind utility classes; avoid inline styles except for dynamic CSS variables
- **Keep components small** — single responsibility; split into sub-components when a file grows large
- **No new runtime dependencies** — the i18n system is hand-rolled; prefer built-ins

## Adding a New Language

1. Copy `src/i18n/locales/en.ts` to `src/i18n/locales/<code>.ts` (e.g. `fr.ts`)
2. Translate all string values — do **not** change the keys
3. Export as `export const fr: Translations = { ... }`
4. Open `src/i18n/index.tsx` and:
   - Add `'fr'` to the `Lang` union type
   - Import `fr` and add it to the `locales` map
5. Add `'fr'` to the `(['en', 'de'] as const)` array in the `LangSwitcher` component inside `src/components/layout/Header.tsx`

## Code of Conduct

Please be respectful and constructive in all interactions. Harassment of any kind will not be tolerated.
