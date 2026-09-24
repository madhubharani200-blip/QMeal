import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { OUTLETS } from '../utils/constants'
import { UtensilsCrossed, Sparkles, Building2, User, ShieldCheck, ChefHat, KeyRound } from 'lucide-react'

const home = {
  student: '/outlets',
  chef: '/chef',
  staff: '/staff',
  manager: '/manager',
}

export default function Login() {
  const { user, login, register, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    registrationNumber: '',
    employeeId: '',
    outletId: OUTLETS[0].id,
    phone: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={home[user.role] || '/outlets'} replace />

  const handleGoogleSignIn = async () => {
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err.message || 'Google Sign-In failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        if (!form.email.trim() || !form.password) {
          throw new Error('Please enter your registered email and password.')
        }
        await login({ email: form.email.trim(), password: form.password })
      } else {
        if (!form.name.trim()) {
          throw new Error('Please enter your full name')
        }
        if (form.role === 'student' && !form.registrationNumber.trim()) {
          throw new Error('Please provide your Student Registration Number')
        }
        if (form.role !== 'student' && !form.employeeId.trim()) {
          throw new Error('Please provide your Employee ID')
        }
        if (!form.email.trim() || !form.password) {
          throw new Error('Please provide a valid email and password')
        }
        await register({
          ...form,
          email: form.email.trim(),
          registrationNumber: form.registrationNumber.trim().toUpperCase(),
          employeeId: form.employeeId.trim().toUpperCase(),
        })
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 font-sans text-stone-100">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(20, 83, 45, 0.95), rgba(12, 38, 24, 0.85) 60%, rgba(10, 15, 12, 0.95)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80)',
        }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-8 lg:grid-cols-12 lg:px-8">
        {/* Left Hero branding */}
        <div className="space-y-6 lg:col-span-6 xl:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Campus Preorder & Waste Reduction Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-900/40">
              <UtensilsCrossed className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">QMeal</h1>
              <p className="text-lg font-medium text-emerald-400">Preorder. Pick Up. Skip the Queue.</p>
            </div>
          </div>

          <p className="max-w-xl text-base leading-relaxed text-stone-300 sm:text-lg">
            Smart multi-outlet food preordering across 5 campus hubs. Featuring QR pickup verification, automated demand forecasting, no-show tracking, and verifiable food waste reduction.
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <Building2 className="mb-1 h-5 w-5 text-amber-400" />
              <div className="text-xl font-bold text-white">5 Outlets</div>
              <div className="text-xs text-stone-400">Cafes & Central Court</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <ShieldCheck className="mb-1 h-5 w-5 text-emerald-400" />
              <div className="text-xl font-bold text-white">QR Pickups</div>
              <div className="text-xs text-stone-400">Zero queue delays</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:col-span-1">
              <ChefHat className="mb-1 h-5 w-5 text-cyan-400" />
              <div className="text-xl font-bold text-white">Smart Forecast</div>
              <div className="text-xs text-stone-400">Rule-based prep sizing</div>
            </div>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="lg:col-span-6 xl:col-span-5">
          <div className="rounded-3xl border border-white/15 bg-stone-900/90 p-6 shadow-2xl shadow-black/80 backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex rounded-xl bg-stone-950/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === 'login'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError('')
                }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === 'register'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-300">Select Role</label>
                    <div className="grid grid-cols-4 gap-1 rounded-xl bg-stone-950 p-1">
                      {['student', 'chef', 'staff', 'manager'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition ${
                            form.role === r
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-300">Full Name</label>
                    <input
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {form.role === 'student' ? (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-300">
                        Student Registration Number
                      </label>
                      <input
                        required
                        placeholder="e.g. 21BCE1042"
                        value={form.registrationNumber}
                        onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })}
                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm uppercase text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-300">Employee ID</label>
                        <input
                          required
                          placeholder="e.g. EMP-902"
                          value={form.employeeId}
                          onChange={(e) => setForm({ ...form, employeeId: e.target.value.toUpperCase() })}
                          className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm uppercase text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-stone-300">Assigned Outlet</label>
                        <select
                          value={form.outletId}
                          onChange={(e) => setForm({ ...form, outletId: e.target.value })}
                          className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        >
                          {OUTLETS.map((out) => (
                            <option key={out.id} value={out.id} className="bg-stone-900 text-white">
                              {out.name} ({out.type})
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-300">Mobile Phone Number</label>
                    <input
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-300">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="name@campus.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-300">Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-xs text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/60 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60"
              >
                {busy ? 'Processing…' : mode === 'login' ? 'Sign In to Account' : 'Create Real Account'}
              </button>
            </form>

            {/* OR Divider */}
            <div className="my-5 flex items-center justify-between gap-3">
              <div className="h-px flex-1 bg-stone-800" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                Or Continue With
              </span>
              <div className="h-px flex-1 bg-stone-800" />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              disabled={busy}
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-700 bg-stone-950/80 px-4 py-2.5 text-sm font-semibold text-stone-200 shadow-md transition hover:border-emerald-500/60 hover:bg-stone-900 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 22.3z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
