import type { Lang } from '../../i18n/index';
import { useI18n, useT } from '../../i18n/index';
import { DesktopNav } from './DesktopNav';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';

function LangSwitcher() {
  const { lang, setLang } = useI18n();
  const t = useT();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      aria-label={t('header.langSwitcher')}
      className="w-auto shrink-0 px-2 py-1 text-[0.72rem] font-bold uppercase
                 rounded-[var(--radius-sm)] border border-[var(--border)]
                 bg-transparent text-[var(--text-muted)]
                 cursor-pointer transition-all duration-[var(--transition)]
                 hover:border-[var(--accent)] hover:text-[var(--accent)]
                 focus:outline-none focus:border-[var(--accent)] focus:text-[var(--accent)]"
    >
      <option value="en">EN</option>
      <option value="de">DE</option>
    </select>
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
        <text x="7" y="29" fontSize="5" fill="white" opacity=".7" fontFamily="sans-serif">
          © WM
        </text>
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
