import { getDb, patchDb, ensureTodaySlots } from './localDb'
import { generateSlotsForDate, remainingCapacity, canBookSlot } from '../utils/slots'
import { todayKey, DEFAULT_SLOT_CAPACITY, DEFAULT_OUTLET_ID } from '../utils/constants'
import { useFirebase, db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'

export async function listSlots(date = todayKey(), outletId = DEFAULT_OUTLET_ID) {
  if (useFirebase && db) {
    let q = query(
      collection(db, 'slots'),
      where('date', '==', date),
      where('outletId', '==', outletId),
    )
    const snap = await getDocs(q)
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.time.localeCompare(b.time))
  }
  const local = ensureTodaySlots(getDb())
  patchDb(() => local)
  return Object.values(local.slots || {})
    .filter((s) => s.date === date && (s.outletId === outletId || !s.outletId))
    .sort((a, b) => a.time.localeCompare(b.time))
}

export async function ensureSlots(
  date = todayKey(),
  outletId = DEFAULT_OUTLET_ID,
  maxCapacity = DEFAULT_SLOT_CAPACITY,
) {
  if (useFirebase && db) {
    const existing = await listSlots(date, outletId)
    if (existing.length) return existing
    const slots = generateSlotsForDate(date, outletId, maxCapacity)
    await Promise.all(slots.map((s) => setDoc(doc(db, 'slots', s.id), s)))
    return slots
  }
  return patchDb((data) => {
    const have = Object.values(data.slots || {}).some(
      (s) => s.date === date && s.outletId === outletId,
    )
    if (!have) {
      generateSlotsForDate(date, outletId, maxCapacity).forEach((s) => {
        if (!data.slots) data.slots = {}
        data.slots[s.id] = s
      })
    }
    return data
  })
}

export async function updateSlotCapacity(slotId, maxCapacity) {
  if (useFirebase && db) {
    await updateDoc(doc(db, 'slots', slotId), { maxCapacity: Number(maxCapacity) })
    return
  }
  patchDb((data) => {
    if (data.slots && data.slots[slotId]) {
      data.slots[slotId].maxCapacity = Number(maxCapacity)
    }
    return data
  })
}

export async function bookSlotSeat(slotId, outletId = DEFAULT_OUTLET_ID) {
  if (useFirebase && db) {
    const slots = await listSlots(todayKey(), outletId)
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || !canBookSlot(slot)) throw new Error('Selected slot is no longer available')
    await updateDoc(doc(db, 'slots', slotId), { bookedCount: (slot.bookedCount || 0) + 1 })
    return
  }
  patchDb((data) => {
    const slot = data.slots[slotId]
    if (!slot || remainingCapacity(slot) <= 0 || !canBookSlot(slot)) {
      throw new Error('Selected slot is no longer available')
    }
    slot.bookedCount = (slot.bookedCount || 0) + 1
    return data
  })
}

export async function releaseSlotSeat(slotId, outletId = DEFAULT_OUTLET_ID) {
  if (useFirebase && db) {
    const slots = await listSlots(todayKey(), outletId)
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return
    await updateDoc(doc(db, 'slots', slotId), {
      bookedCount: Math.max((slot.bookedCount || 0) - 1, 0),
    })
    return
  }
  patchDb((data) => {
    const slot = data.slots[slotId]
    if (slot) slot.bookedCount = Math.max((slot.bookedCount || 0) - 1, 0)
    return data
  })
}

export { remainingCapacity, canBookSlot }
