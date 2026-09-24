import { useState } from 'react'
import AppShell from '../components/AppShell'
import OrderCard from '../components/OrderCard'
import QRDisplay from '../components/QRDisplay'
import ReviewForm from '../components/ReviewForm'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import { cancelOrder } from '../services/orderService'
import { canCancelOrder } from '../utils/slots'
import { QrCode, Star, Ban, X, Sparkles } from 'lucide-react'

export default function OrderHistory() {
  const { user } = useAuth()
  const { orders, loading } = useOrders({ studentId: user?.uid })
  const [selectedQrOrder, setSelectedQrOrder] = useState(null)
  const [reviewModalData, setReviewModalData] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const onCancel = async (id) => {
    setError('')
    setBusyId(id)
    try {
      await cancelOrder(id)
    } catch (e) {
      setError(e.message || 'Failed to cancel order')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AppShell
      title="My Preorder History"
      nav={[
        { to: '/outlets', label: 'All Outlets' },
        { to: '/student', label: 'Menu & Preorder' },
        { to: '/student/history', label: 'My Order History', end: true },
      ]}
    >
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-stone-400 space-y-2">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs">Loading your orders…</p>
        </div>
      ) : !orders.length ? (
        <div className="rounded-3xl border border-stone-800 bg-stone-900/40 p-12 text-center space-y-3">
          <Sparkles className="mx-auto h-8 w-8 text-amber-400" />
          <h3 className="text-lg font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Choose any campus dining outlet and preorder your favorite meals ahead of time.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              actions={
                <>
                  {['pending', 'prepared'].includes(o.status) && (
                    <button
                      type="button"
                      onClick={() => setSelectedQrOrder(o)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Pickup QR Pass</span>
                    </button>
                  )}

                  {canCancelOrder(o) && (
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => onCancel(o.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-800/60 bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-900/40 transition disabled:opacity-50"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>{busyId === o.id ? 'Cancelling…' : 'Cancel Preorder'}</span>
                    </button>
                  )}

                  {o.status === 'picked_up' && o.items?.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setReviewModalData({ order: o, item: o.items[0] })
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-900/40 transition"
                    >
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span>Rate Food Item</span>
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}

      {/* QR Pickup Modal */}
      {selectedQrOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedQrOrder(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-stone-800 bg-stone-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedQrOrder(null)}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <QRDisplay
              orderCode={selectedQrOrder.orderCode}
              label="Staff will scan this at pickup counter"
            />

            <button
              type="button"
              onClick={() => setSelectedQrOrder(null)}
              className="mt-4 w-full rounded-2xl bg-stone-800 py-2.5 text-xs font-bold text-white hover:bg-stone-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalData && (
        <ReviewForm
          order={reviewModalData.order}
          item={reviewModalData.item}
          onClose={() => setReviewModalData(null)}
          onSubmitted={() => setReviewModalData(null)}
        />
      )}
    </AppShell>
  )
}
