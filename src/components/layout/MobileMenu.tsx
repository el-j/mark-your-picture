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
                    w-9 h-9 bg-transparent border border-(--border)
                    cursor-pointer z-101 rounded-sm
                    transition-all duration-(--transition) shrink-0 gap-1 p-0
                    hover:bg-(--surface2) hover:border-(--accent)`}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={toggle}
      >
        <span
          className={`w-4 h-[1.5px] bg-(--text-muted) rounded-sm transition-transform duration-200
                     ${isOpen ? 'translate-y-[5.5px] rotate-45' : ''}`}
        />
        <span
          className={`w-4 h-[1.5px] bg-(--text-muted) rounded-sm transition-opacity duration-200
                     ${isOpen ? 'opacity-0' : ''}`}
        />
        <span
          className={`w-4 h-[1.5px] bg-(--text-muted) rounded-sm transition-transform duration-200
                     ${isOpen ? 'translate-y-[-5.5px] -rotate-45' : ''}`}
        />
      </button>

      {/* Overlay */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 bg-black/50 z-98 transition-all duration-250 min-[900px]:hidden border-none p-0
                    ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={toggle}
        tabIndex={isOpen ? 0 : -1}
      />

      {/* Drawer */}
      <nav
        id="mobile-menu"
        className={`fixed top-0! right-0! bottom-0! w-65 max-w-[80%] min-[900px]:hidden
                    bg-(--surface) border-l border-(--border)
                    h-dvh p-4 pt-17.5
                    flex flex-col gap-1.5 z-99
                    transition-transform duration-250 ease-in-out
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
              `flex items-center gap-2 px-3.5 py-2.5 w-full rounded-sm
               text-[0.95rem] font-medium no-underline
               border border-transparent transition-all duration-(--transition)
               ${
                 isActive
                   ? 'bg-(--accent) text-white border-(--accent)'
                   : 'text-(--text-muted) hover:bg-(--surface2) hover:text-(--text) hover:border-(--border)'
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
