import RatingStars from './RatingStars'
import { Plus, Minus, Check } from 'lucide-react'
import { formatINR } from '../utils/constants'

export default function MenuItemCard({ item, cartQty = 0, onAdd, onRemove }) {
  const isAvailable = item.isAvailable !== false

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
        isAvailable
          ? 'border-stone-800 bg-stone-900/90 shadow-md hover:border-emerald-500/40 hover:bg-stone-900'
          : 'border-stone-800/50 bg-stone-950/60 opacity-60'
      }`}
    >
      <div className="relative h-40 w-full overflow-hidden bg-stone-950">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5">
          <span className="rounded-md bg-stone-950/80 px-2 py-0.5 text-[10px] font-bold text-stone-300 backdrop-blur">
            {item.category}
          </span>
        </div>

        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-950/70 backdrop-blur-[2px]">
            <span className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
              {item.name}
            </h4>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5">
            <RatingStars value={item.avgRating || 4.7} readOnly size={13} />
            <span className="text-[11px] font-semibold text-amber-400">
              {Number(item.avgRating || 4.7).toFixed(1)}
            </span>
            <span className="text-[10px] text-stone-500">
              ({item.totalReviews || 12})
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-stone-800/80 pt-3">
          <div className="text-base font-extrabold text-white">
            {formatINR(item.price)}
          </div>

          {isAvailable ? (
            cartQty > 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 p-1 border border-emerald-500/40">
                <button
                  type="button"
                  onClick={onRemove}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-800 text-white hover:bg-emerald-700 active:scale-95"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-xs font-black text-white">{cartQty}</span>
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            )
          ) : (
            <span className="text-[11px] font-semibold text-stone-500">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  )
}
