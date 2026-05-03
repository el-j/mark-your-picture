// ── Hash-based client-side router ────────────────────────────────────────────

type Route = '/' | '/about' | '/imprint'

const PAGE_IDS: Record<Route, string> = {
  '/':        'page-home',
  '/about':   'page-about',
  '/imprint': 'page-imprint',
}

function parseRoute(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/'
  if (hash === '' || hash === '/') return '/'
  if (hash === '/about') return '/about'
  if (hash === '/imprint') return '/imprint'
  return '/'
}

function navigate(): void {
  const route = parseRoute()

  // Show/hide pages
  for (const [r, id] of Object.entries(PAGE_IDS) as [Route, string][]) {
    const el = document.getElementById(id)
    if (!el) continue
    el.classList.toggle('page-active', r === route)
  }

  // Update nav active states
  document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((a) => {
    const linkRoute = (a.dataset['route'] ?? '/') as Route
    a.classList.toggle('nav-active', linkRoute === route)
  })
}

export function initRouter(): void {
  window.addEventListener('hashchange', navigate)
  window.addEventListener('load', navigate)
  // Run immediately so the initial render is correct before 'load' fires
  navigate()
}
