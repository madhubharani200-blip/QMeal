import { remainingCapacity, canBookSlot } from '../services/slotService'

export default function SlotPicker({ slots, selectedId, onSelect }) {
  if (!slots.length) {
    return <p className="text-sm text-muted">No slots available. Ask manager to generate today&apos;s slots.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
            className={`rounded-xl border px-3 py-3 text-left transition ${
              selected
                ? 'border-brand bg-brand text-white'
                : bookable
                  ? 'border-stone-200 bg-white hover:border-brand'
                  : 'cursor-not-allowed border-stone-100 bg-stone-50 text-stone-400'
            }`}
          >
            <p className="font-semibold">{slot.time}</p>
            <p className={`text-xs ${selected ? 'text-white/80' : 'text-muted'}`}>
              {bookable ? `${rem} left` : rem === 0 ? 'Full' : 'Closed'}
            </p>
          </button>
        )
      })}
    </div>
  )
}
