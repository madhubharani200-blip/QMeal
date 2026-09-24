import { useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import PrepQueue from '../components/PrepQueue'
import OrderCard from '../components/OrderCard'
import { useOrders } from '../hooks/useOrders'
import { buildPrepQueue, markPrepared } from '../services/orderService'
import { todayKey } from '../utils/constants'

export default function ChefDashboard() {
  const { orders, loading } = useOrders({ date: todayKey() })
  const [busy, setBusy] = useState('')
  const queue = useMemo(() => buildPrepQueue(orders), [orders])
  const pendingOrders = orders.filter((o) => o.status === 'pending')

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

  return (
    <AppShell title="Chef · Prep queue">
      <p className="mb-4 text-sm text-muted">
        Live aggregation by item, prioritized by earliest slot. Marks linked pending orders as prepared.
      </p>
      {loading ? (
        <p>Loading queue…</p>
      ) : (
        <>
          <PrepQueue queue={queue} onMarkItemPrepared={markItem} preparingId={busy} />
          <h2 className="font-display mt-8 mb-3 text-xl font-semibold">Pending orders</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {pendingOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                actions={
                  <button
                    type="button"
                    onClick={() => markPrepared(o.id)}
                    className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Mark this order prepared
                  </button>
                }
              />
            ))}
            {!pendingOrders.length && (
              <p className="text-sm text-muted">No pending orders right now.</p>
            )}
          </div>
        </>
      )}
    </AppShell>
  )
}
