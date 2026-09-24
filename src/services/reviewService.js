import { getDb, patchDb, subscribeDb } from './localDb'
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
import { uid } from '../utils/constants'

export async function createReview({
  orderId,
  itemId,
  itemName,
  outletId,
  studentId,
  studentName = 'Student',
  rating,
  comment = '',
}) {
  const reviewId = uid('rev')
  const review = {
    id: reviewId,
    orderId,
    itemId,
    itemName,
    outletId,
    studentId,
    studentName,
    rating: Number(rating),
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  }

  if (useFirebase && db) {
    await setDoc(doc(db, 'reviews', reviewId), review)
    // Update menu item average rating
    try {
      const q = query(collection(db, 'reviews'), where('itemId', '==', itemId))
      const snap = await getDocs(q)
      const allRevs = snap.docs.map((d) => d.data())
      const totalReviews = allRevs.length
      const avgRating =
        totalReviews > 0
          ? Math.round((allRevs.reduce((s, r) => s + (r.rating || 5), 0) / totalReviews) * 10) / 10
          : rating
      await updateDoc(doc(db, 'menuItems', itemId), { avgRating, totalReviews })
    } catch (err) {
      console.warn('Failed to update menu item ratings:', err)
    }
    return review
  }

  patchDb((data) => {
    if (!data.reviews) data.reviews = {}
    data.reviews[reviewId] = review

    // Update menu item ratings
    const allRevs = Object.values(data.reviews).filter((r) => r.itemId === itemId)
    const totalReviews = allRevs.length
    const avgRating =
      totalReviews > 0
        ? Math.round((allRevs.reduce((s, r) => s + (r.rating || 5), 0) / totalReviews) * 10) / 10
        : rating

    if (data.menuItems && data.menuItems[itemId]) {
      data.menuItems[itemId].avgRating = avgRating
      data.menuItems[itemId].totalReviews = totalReviews
    }

    return data
  })

  return review
}

export async function listReviews(filters = {}) {
  if (useFirebase && db) {
    let q = collection(db, 'reviews')
    if (filters.outletId) q = query(q, where('outletId', '==', filters.outletId))
    if (filters.itemId) q = query(q, where('itemId', '==', filters.itemId))
    if (filters.studentId) q = query(q, where('studentId', '==', filters.studentId))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }

  let list = Object.values(getDb().reviews || {})
  if (filters.outletId) list = list.filter((r) => r.outletId === filters.outletId)
  if (filters.itemId) list = list.filter((r) => r.itemId === filters.itemId)
  if (filters.orderId) list = list.filter((r) => r.orderId === filters.orderId)
  if (filters.studentId) list = list.filter((r) => r.studentId === filters.studentId)
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function subscribeReviews(cb, filters = {}) {
  const emit = () => {
    listReviews(filters).then(cb)
  }
  emit()
  return subscribeDb(emit)
}
