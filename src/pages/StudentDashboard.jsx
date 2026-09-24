import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import MenuGrid from '../components/Menu'
import SlotPicker from '../components/SlotPicker'
import PaymentSelector from '../components/PaymentSelector'
import QRDisplay from '../components/QRDisplay'
import { useAuth } from '../hooks/useAuth'
import { useMenu } from '../hooks/useMenu'
import { listSlots, ensureSlots } from '../services/slotService'
import { createOrder } from '../services/orderService'
import { buildCodPayment, simulateUpiPayment, validateUpiId } from '../services/paymentService'
import { formatINR } from '../utils/constants'

const STEPS = ['menu', 'slot', 'pay', 'done']

export default function StudentDashboard() {
  const { user } = useAuth()
  const { menu, loading } = useMenu()
  const [cart, setCart] = useState({})
  const [step, setStep] = useState('menu')
  const [slots, setSlots] = useState([])
  const [slot, setSlot] = useState(null)
  const [method, setMethod] = useState('cod')
  const [upiId, setUpiId] = useState('')
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    ensureSlots().then(() => listSlots().then(setSlots))
  }, [])

  const items = useMemo(() => Object.values(cart), [cart])
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

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
      setError('Pick a pickup slot')
      return
    }
    if (!items.length) {
      setError('Cart is empty')
      return
    }

    setProcessing(true)
    try {
      let payment
      if (method === 'upi') {
        if (!validateUpiId(upiId)) throw new Error('Invalid UPI ID')
        payment = await simulateUpiPayment(upiId)
      } else {
        payment = buildCodPayment()
      }

      const created = await createOrder({
        studentId: user.uid,
        items,
        slot,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        transactionId: payment.transactionId,
      })
      setOrder(created)
      setCart({})
      setStep('done')
    } catch (e) {
      setError(e.message || 'Order failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AppShell
      title="Student preorder"
      nav={[
        { to: '/student', label: 'Order' },
        { to: '/student/history', label: 'History' },
      ]}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {STEPS.filter((s) => s !== 'done' || order).map((s) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
              step === s ? 'bg-brand text-white' : 'bg-white text-muted ring-1 ring-stone-200'
            }`}
          >
            {s}
          </span>
        ))}
      </div>

      {step === 'menu' && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-muted">Loading menu…</p>
          ) : (
            <MenuGrid
              items={menu.filter((m) => m.isAvailable !== false)}
              cart={cart}
              onAdd={add}
              onRemove={remove}
            />
          )}
          <div className="sticky bottom-4 rounded-2xl bg-brand p-4 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">
                {items.reduce((s, i) => s + i.qty, 0)} items · {formatINR(total)}
              </p>
              <button
                type="button"
                disabled={!items.length}
                onClick={() => setStep('slot')}
                className="rounded-xl bg-gold px-4 py-2 font-semibold text-brand-dark disabled:opacity-50"
              >
                Choose slot
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'slot' && (
        <div className="animate-fade-up space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
          <h2 className="font-display text-xl font-semibold">Pick a 15-min pickup slot</h2>
          <p className="text-sm text-muted">Cutoff is 15 minutes before slot start. Full slots are blocked.</p>
          <SlotPicker slots={slots} selectedId={slot?.id} onSelect={setSlot} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('menu')} className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-semibold">
              Back
            </button>
            <button
              type="button"
              disabled={!slot}
              onClick={() => setStep('pay')}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Continue to payment
            </button>
          </div>
        </div>
      )}

      {step === 'pay' && (
        <div className="animate-fade-up space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
          <h2 className="font-display text-xl font-semibold">Checkout · {formatINR(total)}</h2>
          <p className="text-sm text-muted">
            Slot {slot?.time} · Cancel allowed until cutoff ({slot ? new Date(slot.cutoffTime).toLocaleTimeString() : '—'})
          </p>
          <PaymentSelector
            method={method}
            onMethodChange={setMethod}
            upiId={upiId}
            onUpiChange={setUpiId}
            amount={total}
            processing={processing}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('slot')} className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-semibold">
              Back
            </button>
            <button
              type="button"
              disabled={processing || (method === 'upi' && !validateUpiId(upiId))}
              onClick={placeOrder}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {method === 'upi' ? (processing ? 'Paying…' : 'Pay') : 'Confirm COD order'}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && order && (
        <div className="animate-fade-up mx-auto max-w-md space-y-4">
          <div className="rounded-2xl bg-brand-light p-4 text-center">
            <p className="font-display text-2xl font-bold text-brand">Order confirmed</p>
            <p className="text-sm text-muted">
              {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
              {order.transactionId ? ` · ${order.transactionId}` : ''}
            </p>
          </div>
          <QRDisplay orderCode={order.orderCode} />
          <div className="flex justify-center gap-2">
            <Link to="/student/history" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
              View history
            </Link>
            <button
              type="button"
              onClick={() => {
                setOrder(null)
                setStep('menu')
                setSlot(null)
              }}
              className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-semibold"
            >
              New order
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
