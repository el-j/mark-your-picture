import { NavLink } from 'react-router-dom';

const navItems = [
  {
    to: '/',
    label: 'Tool',
    icon: (
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    to: '/about',
    label: 'About',
    icon: (
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    to: '/imprint',
    label: 'Imprint',
    icon: (
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
];

export function DesktopNav() {
  return (
    <nav className="hidden min-[900px]:flex items-center gap-1 shrink-0" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)]
             text-[0.78rem] font-medium no-underline whitespace-nowrap
             border border-transparent transition-all duration-[var(--transition)]
             ${isActive
               ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
               : 'text-[var(--text-muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)] hover:border-[var(--border)]'
             }`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export { navItems };
