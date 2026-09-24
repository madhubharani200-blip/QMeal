/** Canteen operating hours — 15-min slots */
export const CANTEEN_OPEN = '08:00'
export const CANTEEN_CLOSE = '18:00'
export const SLOT_MINUTES = 15
export const CUTOFF_BEFORE_SLOT_MIN = 15
export const DEFAULT_SLOT_CAPACITY = 25

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
  RAZORPAY: 'razorpay',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
}

export const CATEGORIES = ['Breakfast', 'Lunch', 'Snacks', 'Beverages']

export const OUTLETS = [
  {
    id: 'main-food-court',
    name: 'Main Food Court',
    type: 'Food Court',
    location: 'Central Campus Hub, Ground Floor',
    description: 'Full hot meals, executive thalis, authentic biryanis, and lunch combos.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    isActive: true,
    openingHours: '08:00 AM - 06:00 PM',
  },
  {
    id: 'aroma',
    name: 'Aroma Cafe',
    type: 'Cafe',
    location: 'North Campus Building A, Ground Floor',
    description: 'Gourmet subs, grilled paninis, fresh bakery croissants, and artisanal espresso.',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    isActive: true,
    openingHours: '08:30 AM - 05:30 PM',
  },
  {
    id: 'brew',
    name: 'Brew Hub',
    type: 'Cafe',
    location: 'Library Block, 1st Floor Atrium',
    description: 'Cold brews, signature frappes, Belgian waffles, and light study snacks.',
    imageUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80',
    isActive: true,
    openingHours: '08:00 AM - 06:00 PM',
  },
  {
    id: 'spice-corner',
    name: 'Spice Corner',
    type: 'Cafe',
    location: 'South Block, Student Plaza',
    description: 'Authentic Indian chaats, spicy kathi rolls, dosas, and street food favorites.',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    isActive: true,
    openingHours: '09:00 AM - 05:00 PM',
  },
  {
    id: 'bites',
    name: 'Quick Bites Cafe',
    type: 'Cafe',
    location: 'Engineering Quadrangle, East Wing',
    description: 'Loaded burgers, crispy fries, wraps, fruit smoothies, and quick recharge snacks.',
    imageUrl: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80',
    isActive: true,
    openingHours: '08:30 AM - 05:30 PM',
  },
]

export const DEFAULT_OUTLET_ID = 'main-food-court'

export const DEMO_ACCOUNTS = [
  {
    email: 'student@qmeal.demo',
    password: 'demo1234',
    role: 'student',
    name: 'Aarav Sharma',
    registrationNumber: '21BCE1042',
  },
  {
    email: 'chef@qmeal.demo',
    password: 'demo1234',
    role: 'chef',
    name: 'Chef Rajesh',
    employeeId: 'EMP-CHEF-01',
    outletId: 'main-food-court',
  },
  {
    email: 'staff@qmeal.demo',
    password: 'demo1234',
    role: 'staff',
    name: 'Rohan Verma',
    employeeId: 'EMP-STF-102',
    outletId: 'main-food-court',
  },
  {
    email: 'manager@qmeal.demo',
    password: 'demo1234',
    role: 'manager',
    name: 'Meera Iyer',
    employeeId: 'EMP-MGR-501',
    outletId: 'main-food-court',
  },
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
