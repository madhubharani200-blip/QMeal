import { useEffect, useState } from 'react'
import { subscribeOrders } from '../services/orderService'

export function useOrders(filters = {}) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const outletId = filters?.outletId
  const studentId = filters?.studentId
  const date = filters?.date
  const status = filters?.status

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeOrders((list) => {
      setOrders(list)
      setLoading(false)
    }, filters)
    return typeof unsub === 'function' ? unsub : undefined
  }, [outletId, studentId, date, status])

  return { orders, loading }
}
