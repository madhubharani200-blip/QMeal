import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const home = {
  student: '/student',
  chef: '/chef',
  staff: '/staff',
  manager: '/manager',
}

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">Loading QMeal…</div>
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
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={home[user.role] || '/login'} replace />
}
