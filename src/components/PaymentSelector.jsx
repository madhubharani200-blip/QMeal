import { useState } from 'react'
import { validateUpiId } from '../services/paymentService'
import { MockUpiQR } from './QRDisplay'
import { Banknote, Smartphone } from 'lucide-react'

export default function PaymentSelector({
  method,
  onMethodChange,
  upiId,
  onUpiChange,
  amount,
  processing,
}) {
  const [touched, setTouched] = useState(false)
  const upiOk = validateUpiId(upiId)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onMethodChange('cod')}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
            method === 'cod' ? 'border-brand bg-brand-light' : 'border-stone-200 bg-white'
          }`}
        >
          <Banknote className="mt-0.5 text-brand" size={22} />
          <div>
            <p className="font-semibold">Cash on Pickup (COD)</p>
            <p className="text-sm text-muted">Pay at counter when you collect. Order confirmed instantly.</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onMethodChange('upi')}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
            method === 'upi' ? 'border-brand bg-brand-light' : 'border-stone-200 bg-white'
          }`}
        >
          <Smartphone className="mt-0.5 text-accent" size={22} />
          <div>
            <p className="font-semibold">UPI (Simulated)</p>
            <p className="text-sm text-muted">Hackathon demo — no real gateway. Production: Razorpay test mode.</p>
          </div>
        </button>
      </div>

      {method === 'upi' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <label className="text-sm font-medium">UPI ID</label>
          <input
            value={upiId}
            onChange={(e) => onUpiChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="name@bank"
            disabled={processing}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-brand"
          />
          {touched && !upiOk && (
            <p className="mt-1 text-sm text-danger">Enter a valid UPI ID (e.g. student@oksbi)</p>
          )}
          {upiOk && <MockUpiQR upiId={upiId.trim()} amount={amount} />}
          {processing && (
            <p className="animate-pulse-soft mt-3 text-sm font-medium text-brand">
              Processing UPI payment…
            </p>
          )}
        </div>
      )}
    </div>
  )
}
