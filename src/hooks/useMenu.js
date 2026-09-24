import { useEffect, useState } from 'react'
import { subscribeMenu } from '../services/menuService'

export function useMenu() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeMenu((items) => {
      setMenu(items)
      setLoading(false)
    })
    return typeof unsub === 'function' ? unsub : undefined
  }, [])

  return { menu, loading }
}
