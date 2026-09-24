import { formatINR, OUTLETS } from '../utils/constants'
import { Building2, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

const statusStyles = {
  pending: 'bg-amber-950/80 text-amber-300 border-amber-800/50',
  prepared: 'bg-sky-950/80 text-sky-300 border-sky-800/50',
  picked_up: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50',
  cancelled: 'bg-stone-800/80 text-stone-400 border-stone-700/50',
  no_show: 'bg-rose-950/80 text-rose-300 border-rose-800/50',
}

const payStyles = {
  pending: 'bg-amber-950/80 text-amber-300 border-amber-800/50',
  paid: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50',
  failed: 'bg-rose-950/80 text-rose-300 border-rose-800/50',
  refunded: 'bg-stone-800/80 text-stone-300 border-stone-700/50',
}

export default function OrderCard({ order, actions }) {
  const outlet = OUTLETS.find((o) => o.id === order.outletId)

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-lg backdrop-blur hover:border-stone-700 transition">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-black text-emerald-400">
                {order.orderCode}
              </span>
              {outlet && (
                <span className="inline-flex items-center gap-1 rounded-md bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-stone-300">
                  <Building2 className="h-3 w-3 text-amber-400" />
                  {outlet.name}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-400" />
                Slot: <strong className="text-white">{order.slotTime}</strong>
              </span>
              <span>•</span>
              <span>{order.date || 'Today'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                statusStyles[order.status] || statusStyles.pending
              }`}
            >
              {order.status.replace('_', ' ')}
            </span>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                payStyles[order.paymentStatus] || payStyles.pending
              }`}
            >
              {order.paymentMethod} • {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Ordered items list */}
        <div className="my-3 space-y-1.5 divide-y divide-stone-800/40 text-xs">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center justify-between pt-1.5 text-stone-300">
              <span>
                <strong className="text-white">{it.qty}×</strong> {it.name}
              </span>
              <span className="font-mono text-stone-200">{formatINR(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-800/80 pt-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-stone-400">Total Amount:</span>
          <span className="font-mono text-sm font-black text-emerald-400">
            {formatINR(order.totalAmount)}
          </span>
        </div>

        {order.razorpayPaymentId && (
          <p className="mt-1 text-[10px] text-stone-500 font-mono">
            Razorpay ID: {order.razorpayPaymentId}
          </p>
        )}

        {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
