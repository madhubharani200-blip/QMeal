import { useEffect, useState } from 'react'
import { generateOrderQR } from '../services/qrService'
import { QrCode, Copy, Check } from 'lucide-react'

export default function QRDisplay({
  orderCode,
  outletName = 'Campus Canteen',
  label = 'Show this QR code at the counter for pickup',
}) {
  const [src, setSrc] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    generateOrderQR(orderCode).then((url) => {
      if (alive) setSrc(url)
    })
    return () => {
      alive = false
    }
  }, [orderCode])

  const handleCopy = () => {
    navigator.clipboard?.writeText(orderCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center rounded-3xl border border-stone-800 bg-stone-900 p-6 text-center shadow-xl">
      <div className="mb-3 flex items-center gap-1.5 rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-800/50">
        <QrCode className="h-3.5 w-3.5" />
        <span>Verified Pickup Pass</span>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-inner">
        {src ? (
          <img
            src={src}
            alt={`Pickup QR for ${orderCode}`}
            className="h-52 w-52 object-contain"
          />
        ) : (
          <div className="h-52 w-52 animate-pulse rounded-xl bg-stone-200" />
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="font-mono text-2xl font-black tracking-wider text-emerald-400">
          {orderCode}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy Order Code"
          className="rounded-lg border border-stone-700 bg-stone-800 p-1.5 text-stone-300 hover:bg-stone-700 hover:text-white"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <p className="mt-1 text-xs text-stone-400">{label}</p>
      <span className="mt-2 text-[11px] text-stone-500 font-medium">
        Outlet: {outletName}
      </span>
    </div>
  )
}
