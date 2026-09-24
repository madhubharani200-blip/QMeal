/** Canteen operating hours — 15-min slots */
export const CANTEEN_OPEN = '08:00'
export const CANTEEN_CLOSE = '15:00'
export const SLOT_MINUTES = 15
export const CUTOFF_BEFORE_SLOT_MIN = 15
export const DEFAULT_SLOT_CAPACITY = 20

export const ROLES = ['student', 'chef', 'staff', 'manager']

export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARED: 'prepared',
  PICKED_UP: 'picked_up',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
}

export const PAYMENT_METHOD = {
  COD: 'cod',
  UPI: 'upi',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
}

export const CATEGORIES = ['Breakfast', 'Lunch', 'Snacks', 'Beverages']

export const DEMO_ACCOUNTS = [
  { email: 'student@qmeal.demo', password: 'demo1234', role: 'student', name: 'Aarav Student' },
  { email: 'chef@qmeal.demo', password: 'demo1234', role: 'chef', name: 'Priya Chef' },
  { email: 'staff@qmeal.demo', password: 'demo1234', role: 'staff', name: 'Rohan Staff' },
  { email: 'manager@qmeal.demo', password: 'demo1234', role: 'manager', name: 'Meera Manager' },
]

export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

export function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}
