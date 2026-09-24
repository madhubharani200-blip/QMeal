import { formatINR } from '../utils/constants'
import { Minus, Plus } from 'lucide-react'

export default function MenuGrid({ items, cart, onAdd, onRemove }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center text-muted">
        No menu items available today.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const qty = cart[item.id]?.qty || 0
        return (
          <article
            key={item.id}
            className="animate-fade-up overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className="h-36 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(15,61,38,.55), transparent), url(${item.imageUrl})`,
                backgroundColor: '#1a5c3a',
              }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">{item.category}</p>
                  <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                </div>
                <p className="font-semibold text-brand">{formatINR(item.price)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {qty === 0 ? (
                  <button
                    type="button"
                    onClick={() => onAdd(item)}
                    className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    Add
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onRemove(item)}
                      className="rounded-lg bg-brand-light p-1.5 text-brand"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-semibold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => onAdd(item)}
                      className="rounded-lg bg-brand p-1.5 text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
                {!item.isAvailable && <span className="text-xs text-danger">Unavailable</span>}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
