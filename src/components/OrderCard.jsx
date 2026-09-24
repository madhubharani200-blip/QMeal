import { formatINR } from '../utils/constants'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  prepared: 'bg-sky-100 text-sky-800',
  picked_up: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-stone-200 text-stone-600',
  no_show: 'bg-orange-100 text-orange-800',
}

const payStyles = {
  pending: 'bg-accent-soft text-accent',
  paid: 'bg-brand-light text-brand',
  failed: 'bg-red-100 text-red-700',
}

export default function OrderCard({ order, actions }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-semibold">{order.orderCode}</p>
          <p className="text-sm text-muted">
            Slot {order.slotTime} · {formatINR(order.totalAmount)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[order.status]}`}>
            {order.status.replace('_', ' ')}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${payStyles[order.paymentStatus]}`}>
            {order.paymentMethod} · {order.paymentStatus}
          </span>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between text-ink/80">
            <span>
              {it.name} × {it.qty}
            </span>
            <span>{formatINR(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>
      {order.transactionId && (
        <p className="mt-2 text-xs text-muted">Txn: {order.transactionId}</p>
      )}
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
