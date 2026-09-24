import { DEMO_ACCOUNTS, OUTLETS, todayKey, uid, DEFAULT_SLOT_CAPACITY } from '../utils/constants'
import { generateSlotsForDate } from '../utils/slots'
import { buildSeedData } from './seedData'

const STORAGE_KEY = 'qmeal_local_db_v2'

function emptyDb() {
  return {
    outlets: {},
    users: {},
    menuItems: {},
    slots: {},
    orders: {},
    reviews: {},
    dailyStats: {},
    sessions: { currentUid: null },
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

function save(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  window.dispatchEvent(new CustomEvent('qmeal-db'))
}

export function getDb() {
  let db = load()
  if (!db || !db.outlets || !Object.keys(db.outlets).length) {
    db = emptyDb()
    const seeded = buildSeedData()
    db = { ...db, ...seeded, sessions: { currentUid: null } }
    save(db)
  }
  return db
}

export function resetAndSeed() {
  const seeded = buildSeedData()
  const db = { ...emptyDb(), ...seeded, sessions: { currentUid: null } }
  save(db)
  return db
}

export function patchDb(mutator) {
  const db = getDb()
  const next = mutator(structuredClone(db))
  save(next)
  return next
}

export function subscribeDb(cb) {
  const handler = () => cb(getDb())
  window.addEventListener('qmeal-db', handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener('qmeal-db', handler)
    window.removeEventListener('storage', handler)
  }
}

export function ensureTodaySlots(db) {
  const date = todayKey()
  OUTLETS.forEach((out) => {
    const existing = Object.values(db.slots || {}).filter(
      (s) => s.date === date && s.outletId === out.id,
    )
    if (!existing.length) {
      const slots = generateSlotsForDate(date, out.id, DEFAULT_SLOT_CAPACITY)
      slots.forEach((s) => {
        if (!db.slots) db.slots = {}
        db.slots[s.id] = s
      })
    }
  })
  return db
}

export function localSignUp({
  name,
  email,
  password,
  role = 'student',
  registrationNumber = null,
  employeeId = null,
  outletId = null,
  phone = null,
}) {
  return patchDb((db) => {
    const existing = Object.values(db.users).find((u) => u.email === email)
    if (existing) throw new Error('Email already registered')
    const id = uid('user')
    db.users[id] = {
      uid: id,
      name,
      email,
      password,
      role,
      registrationNumber: role === 'student' ? registrationNumber : null,
      employeeId: role !== 'student' ? employeeId : null,
      outletId: role !== 'student' ? outletId : null,
      profilePictureUrl: null,
      phone: phone || '',
      noShowCount: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString(),
    }
    db.sessions.currentUid = id
    return db
  })
}

export function localSignIn({ email, password }) {
  return patchDb((db) => {
    let user = Object.values(db.users).find((u) => u.email === email && u.password === password)
    if (!user) {
      const demo = DEMO_ACCOUNTS.find((d) => d.email === email && d.password === password)
      if (!demo) throw new Error('Invalid email or password')
      const id = uid('user')
      user = {
        uid: id,
        name: demo.name,
        email: demo.email,
        password: demo.password,
        role: demo.role,
        registrationNumber: demo.registrationNumber || null,
        employeeId: demo.employeeId || null,
        outletId: demo.outletId || null,
        phone: '9876543210',
        noShowCount: demo.role === 'student' ? 1 : 0,
        totalOrders: demo.role === 'student' ? 8 : 0,
        createdAt: new Date().toISOString(),
      }
      db.users[id] = user
    }
    db.sessions.currentUid = user.uid
    return db
  })
}

export function localSignOut() {
  return patchDb((db) => {
    db.sessions.currentUid = null
    return db
  })
}

export function localUpdateProfile(uidVal, updates) {
  return patchDb((db) => {
    const user = db.users[uidVal]
    if (!user) throw new Error('User not found')
    db.users[uidVal] = { ...user, ...updates }
    return db
  })
}

export function localCurrentUser() {
  const db = ensureTodaySlots(getDb())
  save(db)
  const uidVal = db.sessions?.currentUid
  if (!uidVal) return null
  const user = db.users[uidVal]
  if (!user) return null
  const { password: _, ...safe } = user
  return safe
}
