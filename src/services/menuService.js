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
} from 'firebase/firestore'
import { todayKey, uid } from '../utils/constants'

export async function listMenu() {
  if (useFirebase) {
    const snap = await getDocs(collection(db, 'menuItems'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
  return Object.values(getDb().menuItems)
}

export function subscribeMenu(cb) {
  if (useFirebase) {
    return onSnapshot(collection(db, 'menuItems'), (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }
  const emit = () => cb(Object.values(getDb().menuItems))
  emit()
  return subscribeDb(emit)
}

export async function upsertMenuItem(item) {
  const id = item.id || uid('menu')
  const payload = {
    ...item,
    id,
    date: item.date || todayKey(),
    isAvailable: item.isAvailable !== false,
  }
  if (useFirebase) {
    await setDoc(doc(db, 'menuItems', id), payload, { merge: true })
    return payload
  }
  patchDb((data) => {
    data.menuItems[id] = { ...data.menuItems[id], ...payload }
    return data
  })
  return payload
}

export async function deleteMenuItem(id) {
  if (useFirebase) {
    await deleteDoc(doc(db, 'menuItems', id))
    return
  }
  patchDb((data) => {
    delete data.menuItems[id]
    return data
  })
}

export async function toggleMenuAvailability(id, isAvailable) {
  if (useFirebase) {
    await updateDoc(doc(db, 'menuItems', id), { isAvailable })
    return
  }
  patchDb((data) => {
    if (data.menuItems[id]) data.menuItems[id].isAvailable = isAvailable
    return data
  })
}
