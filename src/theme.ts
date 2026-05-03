// ── Theme (dark / light) ────────────────────────────────────────────────────

const STORAGE_KEY = 'myp-theme';

type Theme = 'dark' | 'light';

function getPreferred(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
  }
  // Keep browser chrome / PWA status bar in sync
  const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.content = theme === 'dark' ? '#1a1d27' : '#ffffff';
  }
}

export function initTheme(): void {
  apply(getPreferred());
}

export function toggleTheme(): void {
  const current = (document.documentElement.getAttribute('data-theme') as Theme) ?? 'dark';
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEY, next);
  apply(next);
}

const ICON_SUN = `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const ICON_MOON = `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;
