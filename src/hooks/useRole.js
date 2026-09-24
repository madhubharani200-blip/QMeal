import { useAuth } from './useAuth'

export function useRole(allowed = []) {
  const { user, loading } = useAuth()
  const ok = user && (allowed.length === 0 || allowed.includes(user.role))
  return { user, loading, allowed: Boolean(ok) }
}
