import { useTheme } from '../../contexts/ThemeContext';
import { useT } from '../../i18n/index';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useT();

  return (
    <button
      type="button"
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
      className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent text-[var(--text-muted)] transition-all duration-[var(--transition)] hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] hover:text-[var(--accent)]"
    >
      {theme === 'dark' ? (
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
