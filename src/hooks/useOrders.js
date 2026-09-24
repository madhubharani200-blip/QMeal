import { useEffect, useState } from 'react'
import { subscribeOrders } from '../services/orderService'

export function useOrders(filters = {}) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeOrders((list) => {
      setOrders(list)
      setLoading(false)
    }, filters)
    return typeof unsub === 'function' ? unsub : undefined
  }, [filters.studentId, filters.date, filters.status])

  return { orders, loading }
}
