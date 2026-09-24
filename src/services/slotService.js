import { getDb, patchDb, ensureTodaySlots } from './localDb'
import { generateSlotsForDate, remainingCapacity, canBookSlot } from '../utils/slots'
import { todayKey, DEFAULT_SLOT_CAPACITY } from '../utils/constants'
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

export async function listSlots(date = todayKey()) {
  if (useFirebase) {
    const q = query(collection(db, 'slots'), where('date', '==', date))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.time.localeCompare(b.time))
  }
  const local = ensureTodaySlots(getDb())
  patchDb(() => local)
  return Object.values(local.slots)
    .filter((s) => s.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))
}

export async function ensureSlots(date = todayKey(), maxCapacity = DEFAULT_SLOT_CAPACITY) {
  if (useFirebase) {
    const existing = await listSlots(date)
    if (existing.length) return existing
    const slots = generateSlotsForDate(date, maxCapacity)
    await Promise.all(slots.map((s) => setDoc(doc(db, 'slots', s.id), s)))
    return slots
  }
  return patchDb((data) => {
    const have = Object.values(data.slots).some((s) => s.date === date)
    if (!have) {
      generateSlotsForDate(date, maxCapacity).forEach((s) => {
        data.slots[s.id] = s
      })
    }
    return data
  })
}

export async function updateSlotCapacity(slotId, maxCapacity) {
  if (useFirebase) {
    await updateDoc(doc(db, 'slots', slotId), { maxCapacity: Number(maxCapacity) })
    return
  }
  patchDb((data) => {
    if (data.slots[slotId]) data.slots[slotId].maxCapacity = Number(maxCapacity)
    return data
  })
}

export async function bookSlotSeat(slotId) {
  if (useFirebase) {
    const slots = await listSlots()
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || !canBookSlot(slot)) throw new Error('Slot unavailable')
    await updateDoc(doc(db, 'slots', slotId), { bookedCount: (slot.bookedCount || 0) + 1 })
    return
  }
  patchDb((data) => {
    const slot = data.slots[slotId]
    if (!slot || remainingCapacity(slot) <= 0 || !canBookSlot(slot)) {
      throw new Error('Slot unavailable')
    }
    slot.bookedCount = (slot.bookedCount || 0) + 1
    return data
  })
}

export async function releaseSlotSeat(slotId) {
  if (useFirebase) {
    const slots = await listSlots()
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
