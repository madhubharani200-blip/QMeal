import { ChefHat, Clock, CheckCircle2 } from 'lucide-react'

export default function PrepQueue({ queue = [], onMarkItemPrepared, preparingId }) {
  if (!queue.length) {
    return (
      <div className="rounded-3xl border border-stone-800 bg-stone-900/40 p-10 text-center text-stone-400 space-y-2">
        <ChefHat className="mx-auto h-8 w-8 text-emerald-400 opacity-60" />
        <p className="text-sm font-bold text-white">Prep Queue is All Clear!</p>
        <p className="text-xs text-stone-500">
          New student orders for this outlet will automatically aggregate here in real-time.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/90 shadow-xl backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-stone-800 bg-stone-950/80 text-stone-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-5 py-3.5">Food Item</th>
              <th className="px-5 py-3.5 text-center">Batch Quantity</th>
              <th className="px-5 py-3.5">Earliest Slot Required</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/60">
            {queue.map((row) => {
              const rowKey = row.itemId || row.name
              const isBusy = preparingId === rowKey

              return (
                <tr key={rowKey} className="hover:bg-stone-800/30 transition">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white text-sm">{row.name}</div>
                    <div className="text-[11px] text-stone-400">
                      {row.orderIds?.length} linked orders
                    </div>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 text-emerald-300 font-mono text-sm font-black border border-emerald-800/50">
                      {row.qty}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-stone-800 px-2.5 py-1 font-mono font-bold text-amber-400">
                      <Clock className="h-3 w-3" />
                      <span>{row.earliestSlot}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onMarkItemPrepared(row)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition active:scale-95"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isBusy ? 'Marking…' : 'Mark Batch Prepared'}</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
