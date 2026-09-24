import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const home = {
  student: '/outlets',
  chef: '/chef',
  staff: '/staff',
  manager: '/manager',
}

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs font-semibold">Loading QMeal Platform…</span>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={home[user.role] || '/login'} replace />
  }
  return children
}

export function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 text-stone-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={home[user.role] || '/login'} replace />
}
