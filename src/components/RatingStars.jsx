import { useState } from 'react'
import { Star } from 'lucide-react'

export default function RatingStars({
  value = 0,
  onChange = null,
  max = 5,
  size = 16,
  readOnly = false,
  showValue = false,
}) {
  const [hoverValue, setHoverValue] = useState(0)

  const activeValue = hoverValue || value

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, index) => {
          const starNumber = index + 1
          const isFilled = starNumber <= activeValue

          return (
            <button
              key={index}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(starNumber)}
              onMouseEnter={() => !readOnly && setHoverValue(starNumber)}
              onMouseLeave={() => !readOnly && setHoverValue(0)}
              className={`${
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              } p-0.5 transition-transform`}
            >
              <Star
                size={size}
                className={`${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-stone-800 text-stone-600'
                }`}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-amber-400">
          {Number(value || 0).toFixed(1)}
        </span>
      )}
    </div>
  )
}
