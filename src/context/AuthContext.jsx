import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db, useFirebase } from '../services/firebase'
import {
  localSignIn,
  localSignUp,
  localGoogleSignIn,
  localSignOut,
  localCurrentUser,
  localUpdateProfile,
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
    if (useFirebase && auth && db) {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser) {
          setUser(null)
          setLoading(false)
          return
        }
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid))
          const profile = snap.exists() ? snap.data() : {}
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            name: profile.name || fbUser.displayName || 'User',
            role: profile.role || 'student',
            registrationNumber: profile.registrationNumber || null,
            employeeId: profile.employeeId || null,
            outletId: profile.outletId || null,
            profilePictureUrl: profile.profilePictureUrl || fbUser.photoURL || null,
            phone: profile.phone || '',
            noShowCount: profile.noShowCount || 0,
            totalOrders: profile.totalOrders || 0,
          })
        } catch (e) {
          console.error('Failed to fetch user profile:', e)
        } finally {
          setLoading(false)
        }
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

  const register = async ({
    name,
    email,
    password,
    role = 'student',
    registrationNumber = null,
    employeeId = null,
    outletId = null,
    phone = null,
  }) => {
    if (useFirebase && auth && db) {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      const userDocData = {
        name,
        email,
        role,
        registrationNumber: role === 'student' ? registrationNumber : null,
        employeeId: role !== 'student' ? employeeId : null,
        outletId: role !== 'student' ? outletId : null,
        profilePictureUrl: null,
        phone: phone || '',
        noShowCount: 0,
        totalOrders: 0,
        createdAt: new Date().toISOString(),
      }
      await setDoc(doc(db, 'users', cred.user.uid), userDocData)
      return
    }
    localSignUp({
      name,
      email,
      password,
      role,
      registrationNumber,
      employeeId,
      outletId,
      phone,
    })
  }

  const login = async ({ email, password }) => {
    if (useFirebase && auth) {
      await signInWithEmailAndPassword(auth, email, password)
      return
    }
    localSignIn({ email, password })
  }

  const loginWithGoogle = async () => {
    if (useFirebase && auth && db) {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      const fbUser = cred.user
      const snap = await getDoc(doc(db, 'users', fbUser.uid))
      if (!snap.exists()) {
        const userDocData = {
          name: fbUser.displayName || 'Google Student',
          email: fbUser.email,
          role: 'student',
          registrationNumber: '21GOOG' + Math.floor(1000 + Math.random() * 9000),
          employeeId: null,
          outletId: null,
          profilePictureUrl: fbUser.photoURL || null,
          phone: fbUser.phoneNumber || '',
          noShowCount: 0,
          totalOrders: 0,
          createdAt: new Date().toISOString(),
        }
        await setDoc(doc(db, 'users', fbUser.uid), userDocData)
      }
      return
    }
    localGoogleSignIn()
  }

  const logout = async () => {
    if (useFirebase && auth) {
      await fbSignOut(auth)
      return
    }
    localSignOut()
  }

  const updateUserProfile = async (updates) => {
    if (!user) return
    if (useFirebase && db) {
      await updateDoc(doc(db, 'users', user.uid), updates)
      setUser((prev) => ({ ...prev, ...updates }))
      return
    }
    localUpdateProfile(user.uid, updates)
    setUser((prev) => ({ ...prev, ...updates }))
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
      loginWithGoogle,
      logout,
      updateUserProfile,
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
