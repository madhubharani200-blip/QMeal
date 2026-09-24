import { getDb, patchDb } from './localDb'
import { useFirebase, db } from './firebase'
import { collection, doc, getDocs, getDoc, setDoc } from 'firebase/firestore'
import { OUTLETS } from '../utils/constants'

export async function listOutlets() {
  if (useFirebase && db) {
    try {
      const snap = await getDocs(collection(db, 'outlets'))
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      }
    } catch (e) {
      console.warn('Firebase listOutlets error, fallback to constants:', e)
    }
  }
  const local = getDb().outlets
  if (local && Object.keys(local).length) {
    return Object.values(local)
  }
  return OUTLETS
}

export async function getOutletById(outletId) {
  const outlets = await listOutlets()
  return outlets.find((o) => o.id === outletId) || outlets[0]
}
