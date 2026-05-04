import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useT } from '../../i18n/index';
import { navItems } from './DesktopNav';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const t = useT();

  // Close menu on navigation
  // biome-ignore lint/correctness/useExhaustiveDependencies: `location` is the trigger, not a value read inside the effect
  useEffect(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, [location]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? 'hidden' : '';
      return next;
    });
  }, []);

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        className={`flex min-[900px]:hidden flex-col justify-center items-center
                    w-9 h-9 bg-transparent border border-[var(--border)]
                    cursor-pointer z-[101] rounded-[var(--radius-sm)]
                    transition-all duration-[var(--transition)] shrink-0 gap-1 p-0
                    hover:bg-[var(--surface2)] hover:border-[var(--accent)]`}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={toggle}
      >
        <span
          className={`w-4 h-[1.5px] bg-[var(--text-muted)] rounded-sm transition-transform duration-200
                     ${isOpen ? 'translate-y-[5.5px] rotate-45' : ''}`}
        />
        <span
          className={`w-4 h-[1.5px] bg-[var(--text-muted)] rounded-sm transition-opacity duration-200
                     ${isOpen ? 'opacity-0' : ''}`}
        />
        <span
          className={`w-4 h-[1.5px] bg-[var(--text-muted)] rounded-sm transition-transform duration-200
                     ${isOpen ? '-translate-y-[5.5px] -rotate-45' : ''}`}
        />
      </button>

      {/* Overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 bg-black/50 z-[98] transition-all duration-250 min-[900px]:hidden border-none p-0
                    ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={toggle}
        tabIndex={isOpen ? 0 : -1}
      />

      {/* Drawer */}
      <nav
        id="mobile-menu"
        className={`fixed top-0! right-0! bottom-0! w-[260px] max-w-[80%] min-[900px]:hidden
                    bg-[var(--surface)] border-l border-[var(--border)]
                    h-screen p-4 pt-[70px]
                    flex flex-col gap-1.5 z-[99]
                    transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]
                    shadow-[-8px_0_32px_rgba(0,0,0,0.2)]
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2.5 w-full rounded-[var(--radius-sm)]
               text-[0.95rem] font-medium no-underline
               border border-transparent transition-all duration-[var(--transition)]
               ${
                 isActive
                   ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                   : 'text-[var(--text-muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)] hover:border-[var(--border)]'
               }`
            }
          >
            {item.icon}
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
