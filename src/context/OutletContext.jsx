import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { OUTLETS, DEFAULT_OUTLET_ID } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

const OutletContext = createContext(null)

const STORAGE_KEY = 'qmeal_selected_outlet'

export function OutletProvider({ children }) {
  const { user } = useAuth()
  const [selectedOutletId, setSelectedOutletId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_OUTLET_ID
  })

  // Staff / Chef / Manager are scoped to their assigned outletId
  useEffect(() => {
    if (user && user.outletId) {
      setSelectedOutletId(user.outletId)
      localStorage.setItem(STORAGE_KEY, user.outletId)
    }
  }, [user])

  const selectOutlet = (outletId) => {
    // If staff/chef/manager, they cannot switch away from their assigned outlet
    if (user && user.role !== 'student' && user.outletId) {
      setSelectedOutletId(user.outletId)
      return
    }
    setSelectedOutletId(outletId)
    localStorage.setItem(STORAGE_KEY, outletId)
  }

  const currentOutlet = useMemo(() => {
    return (
      OUTLETS.find((o) => o.id === selectedOutletId) ||
      OUTLETS.find((o) => o.id === DEFAULT_OUTLET_ID) ||
      OUTLETS[0]
    )
  }, [selectedOutletId])

  const value = useMemo(
    () => ({
      outlets: OUTLETS,
      selectedOutletId,
      currentOutlet,
      selectOutlet,
      isOutletFixed: Boolean(user && user.role !== 'student' && user.outletId),
    }),
    [selectedOutletId, currentOutlet, user],
  )

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>
}

export function useOutlet() {
  const ctx = useContext(OutletContext)
  if (!ctx) throw new Error('useOutlet must be used within OutletProvider')
  return ctx
}
