import { useWatermark } from '../../contexts/WatermarkContext';
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
      className="w-auto shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent px-2 py-1 font-bold text-[0.72rem] text-[var(--text-muted)] uppercase transition-all duration-[var(--transition)] hover:border-[var(--accent)] hover:text-[var(--accent)] focus:border-[var(--accent)] focus:text-[var(--accent)] focus:outline-none"
    >
      <option value="en">EN</option>
      <option value="de">DE</option>
    </select>
  );
}

export function Header() {
  const t = useT();
  const {
    state: { currentProjectId, projectName },
  } = useWatermark();
  return (
    <header className="sticky top-0 z-20 flex h-[54px] items-center gap-2.5 border-[var(--border)] border-b bg-[var(--surface)] px-4 backdrop-blur-[12px]">
      {/* Logo */}
      <svg
        className="shrink-0 overflow-hidden rounded-[10px]"
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
      <div className="min-w-0 flex-1">
        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap bg-gradient-to-br from-[var(--accent)] to-[#a78bfa] bg-clip-text font-bold text-[1.05rem] text-transparent tracking-tight">
          Mark Your Picture
        </h1>
        {currentProjectId ? (
          <span className="inline-flex max-w-full items-center rounded-[var(--radius-sm)] border border-[var(--accent)] bg-[var(--accent-glow)] px-2 py-0.5 text-[0.68rem] text-[var(--text)]">
            <span className="mr-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{projectName}</span>
          </span>
        ) : (
          <p className="text-[0.68rem] text-[var(--text-muted)]">{t('header.tagline')}</p>
        )}
      </div>

      <DesktopNav />
      <LangSwitcher />
      <ThemeToggle />
      <MobileMenu />
    </header>
  );
}
