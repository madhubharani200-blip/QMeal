import { Link, NavLink } from 'react-router-dom'
import { LogOut, UtensilsCrossed, Building2, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useOutlet } from '../hooks/useOutlet'

export default function AppShell({ title, children, nav = [] }) {
  const { user, logout } = useAuth()
  const { currentOutlet, isOutletFixed } = useOutlet()

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100">
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo & Outlet Scope */}
          <div className="flex items-center gap-4">
            <Link to={user?.role === 'student' ? '/outlets' : `/${user?.role}`} className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-white leading-none">QMeal</p>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wide">Campus Preorders</p>
              </div>
            </Link>

            {/* Outlet Pill */}
            {currentOutlet && (
              <div className="hidden sm:flex items-center gap-2 border-l border-stone-800 pl-4">
                <div className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900 px-2.5 py-1 text-xs">
                  <Building2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="font-bold text-white truncate max-w-[160px]">
                    {currentOutlet.name}
                  </span>
                  {!isOutletFixed && (
                    <Link
                      to="/outlets"
                      className="ml-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline decoration-emerald-600"
                    >
                      Switch
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1.5 md:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900 px-3 py-1.5 hover:border-emerald-500/50 hover:bg-stone-850 transition"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white uppercase">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">{user?.name}</p>
                <p className="text-[10px] uppercase font-semibold text-emerald-400 mt-0.5">{user?.role}</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-stone-800 bg-stone-900 p-2 text-stone-400 hover:border-rose-500/50 hover:bg-rose-950/40 hover:text-rose-400 transition"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {nav.length > 0 && (
          <div className="flex gap-1 overflow-x-auto border-t border-stone-800/80 px-4 py-2 md:hidden">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 text-stone-300'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {title && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-4">
            <h1 className="text-2xl font-black text-white sm:text-3xl">{title}</h1>
            {user?.role === 'student' && currentOutlet && (
              <Link
                to="/outlets"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
              >
                <Building2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Outlet: {currentOutlet.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
