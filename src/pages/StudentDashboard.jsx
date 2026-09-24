import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import MenuGrid from '../components/Menu'
import SlotPicker from '../components/SlotPicker'
import PaymentSelector from '../components/PaymentSelector'
import QRDisplay from '../components/QRDisplay'
import { useAuth } from '../hooks/useAuth'
import { useOutlet } from '../hooks/useOutlet'
import { useMenu } from '../hooks/useMenu'
import { listSlots, ensureSlots } from '../services/slotService'
import { createOrder } from '../services/orderService'
import { buildCodPayment, processRazorpayPayment } from '../services/paymentService'
import { formatINR } from '../utils/constants'
import { ArrowLeft, ShoppingBag, CheckCircle2, Building2, Sparkles, Clock } from 'lucide-react'

const STEPS = ['menu', 'slot', 'pay', 'done']

export default function StudentDashboard() {
  const { user } = useAuth()
  const { currentOutlet, selectedOutletId } = useOutlet()
  const { menu, loading } = useMenu({ outletId: selectedOutletId })
  const [cart, setCart] = useState({})
  const [step, setStep] = useState('menu')
  const [slots, setSlots] = useState([])
  const [slot, setSlot] = useState(null)
  const [method, setMethod] = useState('razorpay')
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  // Load slots for selected outlet
  useEffect(() => {
    if (selectedOutletId) {
      ensureSlots(undefined, selectedOutletId).then(() =>
        listSlots(undefined, selectedOutletId).then(setSlots),
      )
    }
  }, [selectedOutletId])

  const items = useMemo(() => Object.values(cart), [cart])
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const totalQty = items.reduce((s, i) => s + i.qty, 0)

  const add = (item) => {
    if (item.isAvailable === false) return
    setCart((c) => {
      const prev = c[item.id]
      return {
        ...c,
        [item.id]: prev
          ? { ...prev, qty: prev.qty + 1 }
          : { itemId: item.id, name: item.name, price: item.price, qty: 1 },
      }
    })
  }

  const remove = (item) => {
    setCart((c) => {
      const prev = c[item.id]
      if (!prev) return c
      if (prev.qty <= 1) {
        const next = { ...c }
        delete next[item.id]
        return next
      }
      return { ...c, [item.id]: { ...prev, qty: prev.qty - 1 } }
    })
  }

  const placeOrder = async () => {
    setError('')
    if (!slot) {
      setError('Please select a 15-minute pickup slot')
      return
    }
    if (!items.length) {
      setError('Your food tray is empty')
      return
    }

    setProcessing(true)
    try {
      let payment
      if (method === 'razorpay') {
        payment = await processRazorpayPayment({
          amount: total,
          orderCode: 'QM' + Math.floor(100000 + Math.random() * 900000),
          outletName: currentOutlet?.name || 'QMeal Canteen',
          userName: user?.name || 'Student',
          userEmail: user?.email || 'student@campus.edu',
          userPhone: user?.phone || '9876543210',
        })
      } else {
        payment = buildCodPayment()
      }

      const created = await createOrder({
        studentId: user.uid,
        outletId: selectedOutletId,
        items,
        slot,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        razorpayPaymentId: payment.razorpayPaymentId,
      })

      setOrder(created)
      setCart({})
      setStep('done')
    } catch (e) {
      setError(e.message || 'Order creation failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AppShell
      title={currentOutlet ? `${currentOutlet.name}` : 'Student Preorder'}
      nav={[
        { to: '/outlets', label: 'All Outlets' },
        { to: '/student', label: 'Menu & Preorder', end: true },
        { to: '/student/history', label: 'My Order History' },
      ]}
    >
      {/* Progress Steps Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-2">
          {['menu', 'slot', 'pay', 'done'].filter((s) => s !== 'done' || order).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize transition-all ${
                  step === s
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 ring-2 ring-emerald-500/40'
                    : 'border border-stone-800 bg-stone-900 text-stone-400'
                }`}
              >
                <span>{idx + 1}.</span>
                <span>{s === 'pay' ? 'Payment' : s}</span>
              </span>
              {idx < 3 && <span className="text-stone-700 font-bold hidden sm:inline">→</span>}
            </div>
          ))}
        </div>

        {step !== 'menu' && step !== 'done' && (
          <button
            type="button"
            onClick={() => setStep(step === 'pay' ? 'slot' : 'menu')}
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Step 1: Browse Menu */}
      {step === 'menu' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-stone-400 space-y-2">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="text-xs">Loading live menu for {currentOutlet?.name}…</p>
            </div>
          ) : (
            <MenuGrid
              items={menu.filter((m) => m.isAvailable !== false)}
              cart={cart}
              onAdd={add}
              onRemove={remove}
            />
          )}

          {/* Sticky Cart Footer when items added */}
          {totalQty > 0 && (
            <div className="sticky bottom-6 z-30 rounded-3xl border border-emerald-500/40 bg-stone-900/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-md">
              <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">
                      {totalQty} {totalQty === 1 ? 'item' : 'items'} in Tray
                    </p>
                    <p className="text-xs font-mono font-bold text-emerald-400">
                      Total: {formatINR(total)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('slot')}
                  className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-500 active:scale-95 transition"
                >
                  Proceed to Pickup Slot →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Slot Selection */}
      {step === 'slot' && (
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-stone-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-800/40 mb-2">
              <Clock className="h-3.5 w-3.5" />
              <span>Step 2 of 3</span>
            </div>
            <h2 className="text-2xl font-black text-white">Select Your Pickup Time Slot</h2>
            <p className="mt-1 text-xs text-stone-300">
              Pick your 15-minute slot at <span className="font-bold text-emerald-400">{currentOutlet?.name}</span>. Slots prevent long canteen queues and allow chefs to prepare food on time.
            </p>
          </div>

          <SlotPicker slots={slots} selectedId={slot?.id} onSelect={setSlot} />

          <div className="flex items-center justify-between border-t border-stone-800 pt-4">
            <button
              type="button"
              onClick={() => setStep('menu')}
              className="rounded-xl border border-stone-700 px-4 py-2 text-xs font-bold text-stone-300 hover:bg-stone-800"
            >
              Back to Menu
            </button>
            <button
              type="button"
              disabled={!slot}
              onClick={() => setStep('pay')}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
            >
              Continue to Payment →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment Selection & Checkout */}
      {step === 'pay' && (
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-stone-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-800/40 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Step 3 of 3</span>
            </div>
            <h2 className="text-2xl font-black text-white">Payment & Confirmation</h2>
            <p className="mt-1 text-xs text-stone-300">
              Outlet: <span className="font-bold text-emerald-400">{currentOutlet?.name}</span> • Slot:{' '}
              <span className="font-bold text-amber-400">{slot?.time}</span>
            </p>
          </div>

          {/* Order Summary Box */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Order Items</span>
            <div className="divide-y divide-stone-800/60 max-h-40 overflow-y-auto">
              {items.map((it) => (
                <div key={it.itemId} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-stone-200">
                    {it.qty} × {it.name}
                  </span>
                  <span className="font-mono font-bold text-white">{formatINR(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-stone-700 pt-2 text-sm font-black text-white">
              <span>Grand Total</span>
              <span className="font-mono text-emerald-400 text-base">{formatINR(total)}</span>
            </div>
          </div>

          <PaymentSelector
            method={method}
            onMethodChange={setMethod}
            amount={total}
            processing={processing}
          />

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-stone-800 pt-4">
            <button
              type="button"
              onClick={() => setStep('slot')}
              className="rounded-xl border border-stone-700 px-4 py-2 text-xs font-bold text-stone-300 hover:bg-stone-800"
            >
              Back to Slots
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={placeOrder}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60"
            >
              {processing
                ? 'Processing…'
                : method === 'razorpay'
                  ? `Pay ${formatINR(total)} via Razorpay`
                  : 'Confirm Cash on Pickup'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Order Confirmed + Verified QR Code Pass */}
      {step === 'done' && order && (
        <div className="mx-auto max-w-md space-y-6">
          <div className="rounded-3xl border border-emerald-500/40 bg-emerald-950/40 p-5 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 animate-bounce" />
            <h2 className="mt-2 text-xl font-black text-white">Preorder Confirmed!</h2>
            <p className="mt-1 text-xs text-emerald-300">
              {order.paymentMethod === 'razorpay'
                ? `Paid via Razorpay (ID: ${order.razorpayPaymentId || 'TEST_OK'})`
                : 'Payment Method: Cash on Pickup (Pending counter scan)'}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Slot: <strong className="text-white">{order.slotTime}</strong> at {currentOutlet?.name}
            </p>
          </div>

          <QRDisplay
            orderCode={order.orderCode}
            outletName={currentOutlet?.name}
            label="Present this verified QR code at the counter for pickup"
          />

          <div className="flex gap-3">
            <Link
              to="/student/history"
              className="flex-1 rounded-2xl bg-emerald-600 py-3 text-center text-xs font-bold text-white shadow-md hover:bg-emerald-500"
            >
              View in My Orders
            </Link>
            <button
              type="button"
              onClick={() => {
                setOrder(null)
                setStep('menu')
                setSlot(null)
              }}
              className="flex-1 rounded-2xl border border-stone-700 bg-stone-900 py-3 text-xs font-bold text-stone-300 hover:bg-stone-800 hover:text-white"
            >
              Place Another Order
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
