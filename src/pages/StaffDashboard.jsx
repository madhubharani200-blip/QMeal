import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import QRScanner from '../components/QRScanner'
import OrderCard from '../components/OrderCard'
import { useOrders } from '../hooks/useOrders'
import { getOrderByCode, markPickedUp, flagNoShows } from '../services/orderService'
import { todayKey } from '../utils/constants'

export default function StaffDashboard() {
  const { orders, loading } = useOrders({ date: todayKey() })
  const [found, setFound] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    flagNoShows().catch(() => {})
    const t = setInterval(() => flagNoShows().catch(() => {}), 30000)
    return () => clearInterval(t)
  }, [])

  const noShows = useMemo(
    () => orders.filter((o) => o.status === 'no_show'),
    [orders],
  )
  const ready = useMemo(
    () => orders.filter((o) => ['pending', 'prepared'].includes(o.status)),
    [orders],
  )

  const onScan = async (code) => {
    setError('')
    setMessage('')
    const order = await getOrderByCode(code)
    if (!order) {
      setError(`No order found for ${code}`)
      setFound(null)
      return
    }
    setFound(order)
  }

  const confirmPickup = async () => {
    if (!found) return
    try {
      await markPickedUp(found.id)
      setMessage(`Picked up ${found.orderCode}. ${found.paymentMethod === 'cod' && found.paymentStatus === 'pending' ? 'Collect cash at counter.' : 'Payment already settled.'}`)
      setFound({ ...found, status: 'picked_up', paymentStatus: found.paymentMethod === 'cod' ? 'paid' : found.paymentStatus })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <AppShell title="Staff · Pickup counter">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display mb-3 text-xl font-semibold">Scan student QR</h2>
          <QRScanner onScan={onScan} />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          {message && <p className="mt-2 text-sm text-success">{message}</p>}
          {found && (
            <div className="mt-4 space-y-3">
              <OrderCard order={found} />
              {['pending', 'prepared'].includes(found.status) && (
                <button
                  type="button"
                  onClick={confirmPickup}
                  className="w-full rounded-xl bg-brand py-2.5 font-semibold text-white"
                >
                  Mark picked up
                  {found.paymentMethod === 'cod' && found.paymentStatus === 'pending'
                    ? ' · collect COD'
                    : ''}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="font-display mb-3 text-xl font-semibold">Ready for pickup</h2>
            {loading ? (
              <p className="text-muted">Loading…</p>
            ) : (
              <div className="space-y-3">
                {ready.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
                {!ready.length && <p className="text-sm text-muted">No active orders.</p>}
              </div>
            )}
          </section>
          <section>
            <h2 className="font-display mb-3 text-xl font-semibold">No-shows (after slot end)</h2>
            <div className="space-y-3">
              {noShows.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
              {!noShows.length && <p className="text-sm text-muted">No no-shows flagged yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
