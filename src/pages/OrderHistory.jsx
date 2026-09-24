import { useState } from 'react'
import AppShell from '../components/AppShell'
import OrderCard from '../components/OrderCard'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import { cancelOrder } from '../services/orderService'
import { canCancelOrder } from '../utils/slots'
import QRDisplay from '../components/QRDisplay'

export default function OrderHistory() {
  const { user } = useAuth()
  const { orders, loading } = useOrders({ studentId: user.uid })
  const [qr, setQr] = useState(null)
  const [error, setError] = useState('')

  const onCancel = async (id) => {
    setError('')
    try {
      await cancelOrder(id)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <AppShell
      title="Order history"
      nav={[
        { to: '/student', label: 'Order' },
        { to: '/student/history', label: 'History' },
      ]}
    >
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !orders.length ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-10 text-center text-muted">
          No orders yet. Place your first preorder.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              actions={
                <>
                  {['pending', 'prepared'].includes(o.status) && (
                    <button
                      type="button"
                      onClick={() => setQr(o.orderCode)}
                      className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Show QR
                    </button>
                  )}
                  {canCancelOrder(o) && (
                    <button
                      type="button"
                      onClick={() => onCancel(o.id)}
                      className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}

      {qr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setQr(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <QRDisplay orderCode={qr} />
            <button type="button" onClick={() => setQr(null)} className="mt-3 w-full rounded-xl bg-white py-2 font-semibold">
              Close
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
