import { remainingCapacity, canBookSlot } from '../services/slotService'
import { Clock, Users } from 'lucide-react'

export default function SlotPicker({ slots = [], selectedId, onSelect }) {
  if (!slots.length) {
    return (
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 text-center text-xs text-stone-400">
        No active slots generated for this outlet today.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>15-Minute Pickup Slots</span>
        </span>
        <span>Orders cutoff 15m prior</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-h-60 overflow-y-auto pr-1">
        {slots.map((slot) => {
          const rem = remainingCapacity(slot)
          const bookable = canBookSlot(slot)
          const selected = selectedId === slot.id

          return (
            <button
              key={slot.id}
              type="button"
              disabled={!bookable}
              onClick={() => onSelect(slot)}
              className={`flex flex-col items-start justify-between rounded-xl border p-2.5 text-left transition-all ${
                selected
                  ? 'border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-950/60 ring-2 ring-emerald-400/50'
                  : bookable
                    ? 'border-stone-800 bg-stone-900/90 text-stone-200 hover:border-emerald-500/50 hover:bg-stone-850'
                    : 'cursor-not-allowed border-stone-800/40 bg-stone-950/40 text-stone-600'
              }`}
            >
              <div className="text-sm font-black tracking-tight">{slot.time}</div>
              <div
                className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${
                  selected
                    ? 'text-emerald-100'
                    : bookable
                      ? rem <= 5
                        ? 'text-amber-400'
                        : 'text-stone-400'
                      : 'text-stone-600'
                }`}
              >
                <Users className="h-2.5 w-2.5" />
                <span>{bookable ? `${rem} left` : rem === 0 ? 'Full' : 'Closed'}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
