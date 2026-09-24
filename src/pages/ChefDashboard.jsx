import { useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import PrepQueue from '../components/PrepQueue'
import OrderCard from '../components/OrderCard'
import { useAuth } from '../hooks/useAuth'
import { useOutlet } from '../hooks/useOutlet'
import { useOrders } from '../hooks/useOrders'
import { buildPrepQueue, markPrepared } from '../services/orderService'
import { todayKey } from '../utils/constants'
import { ChefHat, Flame, CheckCircle2, Clock } from 'lucide-react'

export default function ChefDashboard() {
  const { user } = useAuth()
  const { currentOutlet } = useOutlet()
  const outletId = user?.outletId || currentOutlet?.id

  const { orders, loading } = useOrders({ date: todayKey(), outletId })
  const [busy, setBusy] = useState('')

  const queue = useMemo(() => buildPrepQueue(orders), [orders])
  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const preparedOrders = orders.filter((o) => o.status === 'prepared')

  const markItem = async (row) => {
    setBusy(row.itemId || row.name)
    try {
      const targets = orders.filter(
        (o) =>
          o.status === 'pending' &&
          o.items.some((it) => (it.itemId || it.name) === (row.itemId || row.name)),
      )
      await Promise.all(targets.map((o) => markPrepared(o.id)))
    } finally {
      setBusy('')
    }
  }

  const markSingleOrder = async (orderId) => {
    setBusy(orderId)
    try {
      await markPrepared(orderId)
    } finally {
      setBusy('')
    }
  }

  return (
    <AppShell
      title={`Kitchen Queue · ${currentOutlet?.name || 'Canteen'}`}
      nav={[{ to: '/chef', label: 'Live Prep Queue', end: true }]}
    >
      <div className="space-y-8">
        {/* Metric KPI cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Flame className="h-4 w-4" />
              <span>Pending Orders</span>
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {pendingOrders.length}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <ChefHat className="h-4 w-4" />
              <span>Prep Batches</span>
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {queue.length}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Ready for Pickup</span>
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {preparedOrders.length}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
              <Clock className="h-4 w-4" />
              <span>Total Day Orders</span>
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {orders.length}
            </div>
          </div>
        </div>

        {/* Aggregated Kitchen Prep Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400" />
              <span>Batch Preparation Queue</span>
            </h2>
            <span className="text-xs text-stone-400">
              Auto-grouped by food item & earliest slot
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-stone-400">Loading kitchen queue…</div>
          ) : (
            <PrepQueue queue={queue} onMarkItemPrepared={markItem} preparingId={busy} />
          )}
        </div>

        {/* Individual Pending Orders List */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            <span>Individual Pending Orders ({pendingOrders.length})</span>
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {pendingOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                actions={
                  <button
                    type="button"
                    disabled={busy === o.id}
                    onClick={() => markSingleOrder(o.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50 transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{busy === o.id ? 'Marking…' : 'Mark Prepared'}</span>
                  </button>
                }
              />
            ))}
            {!pendingOrders.length && !loading && (
              <div className="col-span-2 rounded-2xl border border-stone-800 bg-stone-900/30 p-8 text-center text-xs text-stone-400">
                No individual orders pending preparation.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
