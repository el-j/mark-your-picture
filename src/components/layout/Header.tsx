import { DesktopNav } from './DesktopNav';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { useI18n } from '../../i18n/index';
import { useT } from '../../i18n/index';
import type { Lang } from '../../i18n/index';

function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {(['en', 'de'] as const).map((l: Lang) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2 py-1 text-[0.72rem] font-bold rounded-[var(--radius-sm)] border transition-all duration-[var(--transition)] uppercase
            ${lang === l
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
              : 'bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const t = useT();
  return (
    <header
      className="px-4 h-[54px] flex items-center gap-2.5
                 bg-[var(--surface)] border-b border-[var(--border)]
                 sticky top-0 z-20 backdrop-blur-[12px]"
    >
      {/* Logo */}
      <svg
        className="shrink-0 rounded-[10px] overflow-hidden"
        role="img"
        aria-label="Mark Your Picture logo"
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
      >
        <rect width="32" height="32" rx="8" fill="#6c63ff" />
        <path d="M6 22L11 14l4 6 3-4 6 8H6z" fill="white" opacity=".9" />
        <circle cx="21" cy="11" r="3" fill="white" opacity=".9" />
        <path d="M4 26h24" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
        <text x="7" y="29" fontSize="5" fill="white" opacity=".7" fontFamily="sans-serif">© WM</text>
      </svg>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1
          className="text-[1.05rem] font-bold tracking-tight whitespace-nowrap
                     overflow-hidden text-ellipsis
                     bg-gradient-to-br from-[var(--accent)] to-[#a78bfa]
                     bg-clip-text text-transparent"
        >
          Mark Your Picture
        </h1>
        <p className="text-[0.68rem] text-[var(--text-muted)]">{t('header.tagline')}</p>
      </div>

      <DesktopNav />
      <LangSwitcher />
      <ThemeToggle />
      <MobileMenu />
    </header>
  );
}
