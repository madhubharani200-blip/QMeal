import { useOutlet } from '../hooks/useOutlet'
import { useAuth } from '../hooks/useAuth'
import OutletCard from '../components/OutletCard'
import { UtensilsCrossed, Building2, User, LogOut, ShieldCheck, History } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function OutletSelection() {
  const { outlets } = useOutlet()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">QMeal</span>
              <span className="ml-2 hidden rounded-md bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/40 sm:inline-block">
                Campus Multi-Outlet
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'student' && (
              <Link
                to="/student/history"
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 hover:border-stone-700 hover:text-white"
              >
                <History className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">My Orders</span>
              </Link>
            )}

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-emerald-500/50 hover:bg-stone-850"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white uppercase">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <span className="max-w-[120px] truncate">{user?.name}</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="rounded-xl border border-stone-800 bg-stone-900 p-2 text-stone-400 transition hover:border-rose-500/40 hover:bg-rose-950/40 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/80 via-stone-900 to-stone-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Campus Dining Network</span>
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              Choose your Dining Outlet
            </h1>
            <p className="text-sm sm:text-base text-stone-300">
              Select any of the 5 campus canteens to browse live menus, schedule your 15-minute pickup slot, and pay seamlessly via Razorpay or COD.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-cover bg-center opacity-15 pointer-events-none hidden md:block"
               style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80)' }} />
        </div>

        {/* Outlet Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Available Outlets</span>
            <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-xs text-emerald-400 font-mono">
              {outlets.length}
            </span>
          </h2>
          <span className="text-xs text-stone-400 hidden sm:inline">
            Each outlet has independent slots & chefs
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outlets.map((outlet) => (
            <OutletCard key={outlet.id} outlet={outlet} />
          ))}
        </div>
      </main>
    </div>
  )
}
