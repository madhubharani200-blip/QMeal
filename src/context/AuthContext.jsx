import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, useFirebase } from '../services/firebase'
import {
  localSignIn,
  localSignUp,
  localSignOut,
  localCurrentUser,
  subscribeDb,
  getDb,
  resetAndSeed,
} from '../services/localDb'
import { DEMO_ACCOUNTS } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (useFirebase) {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) {
          setUser(null)
          setLoading(false)
          return
        }
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        const profile = snap.exists() ? snap.data() : {}
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          name: profile.name || fbUser.displayName || 'User',
          role: profile.role || 'student',
          noShowCount: profile.noShowCount || 0,
          totalOrders: profile.totalOrders || 0,
        })
        setLoading(false)
      })
      return unsub
    }

    const sync = () => {
      setUser(localCurrentUser())
      setLoading(false)
    }
    sync()
    return subscribeDb(sync)
  }, [])

  const register = async ({ name, email, password, role = 'student' }) => {
    if (useFirebase) {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        role,
        noShowCount: 0,
        totalOrders: 0,
      })
      return
    }
    localSignUp({ name, email, password, role })
  }

  const login = async ({ email, password }) => {
    if (useFirebase) {
      await signInWithEmailAndPassword(auth, email, password)
      return
    }
    localSignIn({ email, password })
  }

  const logout = async () => {
    if (useFirebase) {
      await fbSignOut(auth)
      return
    }
    localSignOut()
  }

  const refreshProfile = () => {
    if (!useFirebase) setUser(localCurrentUser())
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      useFirebase,
      demoMode: !useFirebase,
      demoAccounts: DEMO_ACCOUNTS,
      resetDemoData: () => {
        resetAndSeed()
        setUser(null)
      },
      getLocalDb: getDb,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
