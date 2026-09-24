import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UtensilsCrossed } from 'lucide-react'

const home = {
  student: '/student',
  chef: '/chef',
  staff: '/staff',
  manager: '/manager',
}

export default function Login() {
  const { user, login, register, demoAccounts, demoMode, resetDemoData } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: 'student@qmeal.demo',
    password: 'demo1234',
    role: 'student',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={home[user.role]} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(form)
      else await register(form)
    } catch (err) {
      setError(err.message || 'Auth failed')
    } finally {
      setBusy(false)
    }
  }

  const quick = async (account) => {
    setBusy(true)
    setError('')
    try {
      await login(account)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(105deg, rgba(15,61,38,.92) 0%, rgba(15,61,38,.75) 42%, rgba(15,61,38,.35) 100%), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80)',
        }}
      />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <div className="animate-fade-up text-white">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-brand-dark">
              <UtensilsCrossed size={24} />
            </span>
            <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">QMeal</h1>
          </div>
          <p className="font-display text-2xl text-gold md:text-3xl">Preorder. Pick Up. Skip the Queue.</p>
          <p className="mt-4 max-w-md text-white/85">
            Canteen preorder, forecasting & waste reduction — four live roles, QR pickup, and impact metrics judges can feel.
          </p>
        </div>

        <div className="animate-fade-up rounded-3xl bg-white/95 p-6 shadow-xl backdrop-blur sm:p-8" style={{ animationDelay: '80ms' }}>
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === 'login' ? 'bg-brand text-white' : 'bg-stone-100'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === 'register' ? 'bg-brand text-white' : 'bg-stone-100'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <>
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand"
                />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand"
                >
                  <option value="student">Student</option>
                  <option value="chef">Chef</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </>
            )}
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand"
            />
            <input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-brand"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {demoMode && (
            <div className="mt-6 border-t border-stone-100 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Demo accounts (password: demo1234)</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    disabled={busy}
                    onClick={() => quick(a)}
                    className="rounded-xl border border-stone-200 px-2 py-2 text-left text-xs hover:border-brand"
                  >
                    <span className="block font-semibold capitalize">{a.role}</span>
                    <span className="text-muted">{a.email}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={resetDemoData}
                className="mt-3 text-xs text-muted underline hover:text-brand"
              >
                Reset seeded demo data
              </button>
              <p className="mt-2 text-[11px] text-muted">
                Running in local demo mode. Add Firebase env vars from <Link className="underline" to="#">.env.example</Link> for production Auth/Firestore.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
