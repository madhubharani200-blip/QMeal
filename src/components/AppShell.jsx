import { Link, NavLink } from 'react-router-dom'
import { LogOut, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const roleHome = {
  student: '/student',
  chef: '/chef',
  staff: '/staff',
  manager: '/manager',
}

export default function AppShell({ title, children, nav = [] }) {
  const { user, logout, demoMode } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-brand/10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to={roleHome[user?.role] || '/'} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-gold">
              <UtensilsCrossed size={18} />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-none text-brand">QMeal</p>
              <p className="text-[11px] text-muted">Preorder. Pick Up. Skip the Queue.</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-brand text-white' : 'text-ink/70 hover:bg-brand-light'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {demoMode && (
              <span className="hidden rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent sm:inline">
                Demo mode
              </span>
            )}
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-[11px] capitalize text-muted">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-stone-200 p-2 text-muted hover:bg-stone-50"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        {nav.length > 0 && (
          <div className="flex gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1 text-sm ${
                    isActive ? 'bg-brand text-white' : 'bg-stone-100 text-ink/70'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {title && <h1 className="font-display mb-5 text-3xl font-bold text-brand-dark">{title}</h1>}
        {children}
      </main>
    </div>
  )
}
