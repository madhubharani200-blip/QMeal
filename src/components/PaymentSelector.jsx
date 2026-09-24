import { CreditCard, Banknote, ShieldCheck, Sparkles } from 'lucide-react'
import { formatINR } from '../utils/constants'

export default function PaymentSelector({
  method,
  onMethodChange,
  amount,
  processing,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onMethodChange('razorpay')}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
            method === 'razorpay'
              ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50'
              : 'border-stone-800 bg-stone-900/80 hover:border-stone-700'
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white text-sm">Razorpay</p>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-300">
                TEST MODE
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-400">
              UPI, Cards & NetBanking. Real test mode webhook & instant payment status.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onMethodChange('cod')}
          className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
            method === 'cod'
              ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50'
              : 'border-stone-800 bg-stone-900/80 hover:border-stone-700'
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white text-sm">Cash on Pickup (COD)</p>
            </div>
            <p className="mt-1 text-xs text-stone-400">
              Order confirmed instantly. Pay cash at counter when staff scans your pickup QR code.
            </p>
          </div>
        </button>
      </div>

      {method === 'razorpay' && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Razorpay Test Integration Activated</span>
          </div>
          <p className="mt-1.5 text-xs text-stone-300">
            Total Payable: <strong className="text-white font-mono">{formatINR(amount)}</strong>. You can use standard Razorpay test cards (e.g. Card: 4111 1111 1111 1111, OTP: 123456) or simulated test approval.
          </p>
        </div>
      )}

      {processing && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300 animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>Processing payment with Razorpay Gateway…</span>
        </div>
      )}
    </div>
  )
}
