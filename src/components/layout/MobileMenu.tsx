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
        className={`z-101 flex h-9 w-9 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-(--border) bg-transparent p-0 transition-all duration-(--transition) hover:border-(--accent) hover:bg-(--surface2) min-[900px]:hidden`}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={toggle}
      >
        <span
          className={`h-[1.5px] w-4 rounded-sm bg-(--text-muted) transition-transform duration-200 ${isOpen ? 'translate-y-[5.5px] rotate-45' : ''}`}
        />
        <span
          className={`h-[1.5px] w-4 rounded-sm bg-(--text-muted) transition-opacity duration-200 ${isOpen ? 'opacity-0' : ''}`}
        />
        <span
          className={`h-[1.5px] w-4 rounded-sm bg-(--text-muted) transition-transform duration-200 ${isOpen ? 'translate-y-[-5.5px] -rotate-45' : ''}`}
        />
      </button>

      {/* Overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-98 border-none bg-black/50 p-0 transition-all duration-250 min-[900px]:hidden ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
        onClick={toggle}
        tabIndex={isOpen ? 0 : -1}
      />

      {/* Drawer */}
      <nav
        id="mobile-menu"
        className={`fixed top-0! right-0! bottom-0! z-99 flex h-svh w-65 max-w-[80%] flex-col gap-1.5 border-(--border) border-l bg-(--surface) p-4 pt-17.5 shadow-[-8px_0_32px_rgba(0,0,0,0.2)] transition-transform duration-250 ease-in-out min-[900px]:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex w-full items-center gap-2 rounded-sm border border-transparent px-3.5 py-2.5 font-medium text-[0.95rem] no-underline transition-all duration-(--transition) ${
                isActive
                  ? 'border-(--accent) bg-(--accent) text-white'
                  : 'text-(--text-muted) hover:border-(--border) hover:bg-(--surface2) hover:text-(--text)'
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
