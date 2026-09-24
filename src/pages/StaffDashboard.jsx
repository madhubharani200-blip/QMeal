import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import QRScanner from '../components/QRScanner'
import OrderCard from '../components/OrderCard'
import { useAuth } from '../hooks/useAuth'
import { useOutlet } from '../hooks/useOutlet'
import { useOrders } from '../hooks/useOrders'
import { getOrderByCode, markPickedUp, flagNoShows } from '../services/orderService'
import { todayKey, formatINR } from '../utils/constants'
import { QrCode, CheckCircle2, AlertTriangle, Banknote, ShieldAlert, Sparkles } from 'lucide-react'

export default function StaffDashboard() {
  const { user } = useAuth()
  const { currentOutlet } = useOutlet()
  const outletId = user?.outletId || currentOutlet?.id

  const { orders, loading } = useOrders({ date: todayKey(), outletId })
  const [found, setFound] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [flaggedCount, setFlaggedCount] = useState(0)

  // Auto-flag no shows for this outlet every 30s
  useEffect(() => {
    flagNoShows(new Date(), outletId).then(setFlaggedCount).catch(() => {})
    const t = setInterval(() => {
      flagNoShows(new Date(), outletId).then(setFlaggedCount).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [outletId])

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
    const order = await getOrderByCode(code, outletId)
    if (!order) {
      setError(`Order "${code}" not found for ${currentOutlet?.name || 'this outlet'}.`)
      setFound(null)
      return
    }
    setFound(order)
  }

  const confirmPickup = async () => {
    if (!found) return
    try {
      await markPickedUp(found.id)
      const isCodPending = found.paymentMethod === 'cod' && found.paymentStatus === 'pending'
      setMessage(
        `✓ Order #${found.orderCode} verified & marked picked up! ${
          isCodPending
            ? `Collected ${formatINR(found.totalAmount)} cash at counter.`
            : 'Payment was prepaid via Razorpay.'
        }`,
      )
      setFound({
        ...found,
        status: 'picked_up',
        paymentStatus: 'paid',
      })
    } catch (e) {
      setError(e.message || 'Failed to complete pickup')
    }
  }

  return (
    <AppShell
      title={`Pickup Verification · ${currentOutlet?.name || 'Counter'}`}
      nav={[{ to: '/staff', label: 'Counter Verification', end: true }]}
    >
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: QR Camera Scanner + Scanned Order Confirmation */}
        <div className="space-y-6 lg:col-span-6 xl:col-span-5">
          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-400" />
                <span>Scan Student Pickup QR</span>
              </h2>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/40">
                Live Scanner
              </span>
            </div>

            <QRScanner onScan={onScan} />

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{message}</span>
              </div>
            )}
          </div>

          {/* Verified Order Card & Action */}
          {found && (
            <div className="rounded-3xl border border-emerald-500/40 bg-stone-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Scanned Verification
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {found.orderCode}
                </span>
              </div>

              <OrderCard order={found} />

              {found.paymentMethod === 'cod' && found.paymentStatus === 'pending' && (
                <div className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-950/50 p-3 text-xs text-amber-200">
                  <Banknote className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">Cash Collection Required</strong>
                    <span>Please collect <strong className="text-white font-mono">{formatINR(found.totalAmount)}</strong> cash from the student before handing over the meal.</span>
                  </div>
                </div>
              )}

              {['pending', 'prepared'].includes(found.status) && (
                <button
                  type="button"
                  onClick={confirmPickup}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-extrabold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
                >
                  Confirm Pickup & Hand Over Food
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Active Ready Queue + Auto-flagged No-shows */}
        <div className="space-y-6 lg:col-span-6 xl:col-span-7">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Ready for Pickup Counter ({ready.length})</span>
              </h2>
              <span className="text-xs text-stone-400">Slots today</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-stone-400">Loading counter queue…</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {ready.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    actions={
                      <button
                        type="button"
                        onClick={() => setFound(o)}
                        className="rounded-xl bg-stone-800 px-3 py-1.5 text-xs font-bold text-stone-200 hover:bg-stone-700"
                      >
                        Inspect / Verify
                      </button>
                    }
                  />
                ))}
                {!ready.length && (
                  <div className="col-span-2 rounded-2xl border border-stone-800 bg-stone-900/30 p-8 text-center text-xs text-stone-400">
                    No orders waiting at the counter.
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="space-y-3 border-t border-stone-800 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>Auto-Flagged No-Shows ({noShows.length})</span>
              </h2>
              <span className="text-xs text-stone-400">
                Slot ended with no pickup
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {noShows.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
              {!noShows.length && (
                <div className="col-span-2 rounded-2xl border border-stone-800 bg-stone-900/30 p-6 text-center text-xs text-stone-400">
                  Zero no-shows recorded today.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
