import { getDb, patchDb, subscribeDb } from './localDb'
import { useFirebase, db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { todayKey, uid, DEFAULT_OUTLET_ID } from '../utils/constants'

export async function listMenu(filters = {}) {
  if (useFirebase && db) {
    let q = collection(db, 'menuItems')
    if (filters.outletId) {
      q = query(q, where('outletId', '==', filters.outletId))
    }
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }

  let items = Object.values(getDb().menuItems || {})
  if (filters.outletId) {
    items = items.filter((it) => it.outletId === filters.outletId)
  }
  return items
}

export function subscribeMenu(cb, filters = {}) {
  if (useFirebase && db) {
    let q = collection(db, 'menuItems')
    if (filters.outletId) {
      q = query(q, where('outletId', '==', filters.outletId))
    }
    return onSnapshot(q, (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }
  const emit = () => {
    let items = Object.values(getDb().menuItems || {})
    if (filters.outletId) {
      items = items.filter((it) => it.outletId === filters.outletId)
    }
    cb(items)
  }
  emit()
  return subscribeDb(emit)
}

export async function upsertMenuItem(item) {
  const id = item.id || uid('menu')
  const payload = {
    ...item,
    id,
    outletId: item.outletId || DEFAULT_OUTLET_ID,
    date: item.date || todayKey(),
    isAvailable: item.isAvailable !== false,
    avgRating: Number(item.avgRating || 4.8),
    totalReviews: Number(item.totalReviews || 10),
  }
  if (useFirebase && db) {
    await setDoc(doc(db, 'menuItems', id), payload, { merge: true })
    return payload
  }
  patchDb((data) => {
    if (!data.menuItems) data.menuItems = {}
    data.menuItems[id] = { ...data.menuItems[id], ...payload }
    return data
  })
  return payload
}

export async function deleteMenuItem(id) {
  if (useFirebase && db) {
    await deleteDoc(doc(db, 'menuItems', id))
    return
  }
  patchDb((data) => {
    if (data.menuItems) delete data.menuItems[id]
    return data
  })
}

export async function toggleMenuAvailability(id, isAvailable) {
  if (useFirebase && db) {
    await updateDoc(doc(db, 'menuItems', id), { isAvailable })
    return
  }
  patchDb((data) => {
    if (data.menuItems && data.menuItems[id]) {
      data.menuItems[id].isAvailable = isAvailable
    }
    return data
  })
}
