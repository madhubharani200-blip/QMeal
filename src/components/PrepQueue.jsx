export default function PrepQueue({ queue, onMarkItemPrepared, preparingId }) {
  if (!queue.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 p-10 text-center text-muted">
        Prep queue is empty. New student orders appear here live.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand text-white">
          <tr>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Qty</th>
            <th className="px-4 py-3 font-medium">Priority slot</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((row) => (
            <tr key={row.itemId || row.name} className="border-t border-stone-100">
              <td className="px-4 py-3 font-semibold">{row.name}</td>
              <td className="px-4 py-3">{row.qty}</td>
              <td className="px-4 py-3">{row.earliestSlot}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  disabled={preparingId === (row.itemId || row.name)}
                  onClick={() => onMarkItemPrepared(row)}
                  className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  Mark prepared
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
