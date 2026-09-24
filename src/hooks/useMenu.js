import { useEffect, useState } from 'react'
import { subscribeMenu } from '../services/menuService'

export function useMenu(filters = {}) {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)

  const outletId = filters?.outletId

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeMenu(
      (items) => {
        setMenu(items)
        setLoading(false)
      },
      filters,
    )
    return typeof unsub === 'function' ? unsub : undefined
  }, [outletId])

  return { menu, loading }
}
