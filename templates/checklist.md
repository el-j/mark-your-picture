# Cross-Cutting Checklist

Included in all task plans. Every item must be checked before merge.

## Code Quality

- [ ] TypeScript strict mode — no implicit `any`, no type assertions without justification
- [ ] Biome passes — `npm run check` exits 0
- [ ] Build passes — `npm run build` exits 0
- [ ] No `console.log` in production code

## Internationalization

- [ ] All user-facing strings use i18n keys (no hardcoded English in JSX)
- [ ] New keys added to BOTH `src/i18n/locales/en.ts` AND `src/i18n/locales/de.ts`
- [ ] Key names follow existing convention (`tool.watermark.opacity`, etc.)

## React & Architecture

- [ ] Functional components only, no class components
- [ ] Tailwind classes for styling, no inline `style={}` except canvas/dynamic values
- [ ] No prop drilling — use WatermarkContext or ThemeContext where applicable
- [ ] `src/lib/` functions are pure — no React imports in lib files
- [ ] Context API changes are backwards-compatible (or all consumers updated)

## Testing

- [ ] Vitest unit tests for new/changed lib functions
- [ ] Component tests for non-trivial UI logic
- [ ] Playwright E2E test for user-visible flows
- [ ] Existing tests still pass — `npm test && npm run e2e`

## Error Handling & UX

- [ ] Errors shown to user via Toast component (not silent failures)
- [ ] Loading/processing states visible (ProgressBar for batch operations)
- [ ] User input validated at boundaries
- [ ] Object URLs revoked (`URL.revokeObjectURL`) after use
- [ ] Canvas resources cleaned up

## Mobile & PWA

- [ ] Touch interactions work (tap, drag if applicable)
- [ ] No new uncached network requests (check vite-plugin-pwa config)
- [ ] If new icons needed: `npm run generate-icons` run + output committed

## Traceability

- [ ] `Feature: {ID}` added to JSDoc on new/changed exports
- [ ] Commit message follows Conventional Commits format
