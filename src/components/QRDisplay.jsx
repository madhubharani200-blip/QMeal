import { useEffect, useState } from 'react'
import { generateOrderQR, generateMockUpiQR } from '../services/qrService'

export default function QRDisplay({ orderCode, label = 'Show this QR at pickup' }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let alive = true
    generateOrderQR(orderCode).then((url) => {
      if (alive) setSrc(url)
    })
    return () => {
      alive = false
    }
  }, [orderCode])

  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-stone-100">
      {src ? <img src={src} alt={`QR for ${orderCode}`} className="h-56 w-56" /> : <div className="h-56 w-56 animate-pulse-soft rounded-xl bg-stone-100" />}
      <p className="font-display mt-3 text-2xl font-bold tracking-wide text-brand">{orderCode}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  )
}

export function MockUpiQR({ upiId, amount }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    if (!upiId) return
    let alive = true
    generateMockUpiQR(upiId, amount).then((url) => {
      if (alive) setSrc(url)
    })
    return () => {
      alive = false
    }
  }, [upiId, amount])
  if (!src) return null
  return (
    <div className="mt-3 flex flex-col items-center">
      <img src={src} alt="Mock UPI QR" className="h-36 w-36 rounded-lg border border-stone-100" />
      <p className="mt-1 text-[10px] text-muted">Visual only — not a real payment link</p>
    </div>
  )
}
