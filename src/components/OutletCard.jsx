import { useNavigate } from 'react-router-dom'
import { useOutlet } from '../hooks/useOutlet'
import { MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react'

export default function OutletCard({ outlet }) {
  const navigate = useNavigate()
  const { selectOutlet, selectedOutletId } = useOutlet()
  const isSelected = selectedOutletId === outlet.id

  const handleSelect = () => {
    selectOutlet(outlet.id)
    navigate('/student')
  }

  return (
    <div
      onClick={handleSelect}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
        isSelected
          ? 'border-emerald-500 bg-stone-900 shadow-xl shadow-emerald-950/40 ring-2 ring-emerald-500/50'
          : 'border-white/10 bg-stone-900/90 shadow-lg hover:border-emerald-500/50 hover:bg-stone-900'
      }`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-stone-950 sm:h-52">
        <img
          src={outlet.imageUrl}
          alt={outlet.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-amber-400" />
            {outlet.type}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Open Now
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-extrabold text-white sm:text-2xl">{outlet.name}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{outlet.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>{outlet.openingHours || '08:00 AM - 06:00 PM'}</span>
          </div>

          <p className="text-xs leading-relaxed text-stone-300 line-clamp-2">
            {outlet.description}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400">
            12-16 Preorder Items
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition group-hover:bg-emerald-500"
          >
            <span>Enter Canteen</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
