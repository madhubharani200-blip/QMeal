import { getDb, patchDb, subscribeDb } from './localDb'
import { useFirebase, db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { makeOrderCode, newOrderId, canCancelOrder, shouldFlagNoShow } from '../utils/slots'
import { bookSlotSeat, releaseSlotSeat } from './slotService'
import { todayKey, DEFAULT_OUTLET_ID } from '../utils/constants'

export async function createOrder({
  studentId,
  outletId = DEFAULT_OUTLET_ID,
  items,
  slot,
  paymentMethod,
  paymentStatus,
  razorpayPaymentId = null,
  transactionId = null,
}) {
  const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0)
  const order = {
    id: newOrderId(),
    studentId,
    outletId: outletId || slot.outletId || DEFAULT_OUTLET_ID,
    items,
    slotId: slot.id,
    slotTime: slot.time,
    slotEndIso: slot.slotEndIso,
    totalAmount,
    orderCode: makeOrderCode(),
    status: 'pending',
    paymentMethod,
    paymentStatus,
    razorpayPaymentId: razorpayPaymentId || transactionId,
    cutoffTime: slot.cutoffTime,
    createdAt: new Date().toISOString(),
    date: slot.date || todayKey(),
  }

  await bookSlotSeat(slot.id, order.outletId)

  if (useFirebase && db) {
    await setDoc(doc(db, 'orders', order.id), order)
    return order
  }

  patchDb((data) => {
    if (!data.orders) data.orders = {}
    data.orders[order.id] = order
    const user = data.users?.[studentId]
    if (user) user.totalOrders = (user.totalOrders || 0) + 1
    return data
  })
  return order
}

export async function listOrders(filters = {}) {
  if (useFirebase && db) {
    let q = collection(db, 'orders')
    if (filters.outletId) q = query(q, where('outletId', '==', filters.outletId))
    if (filters.studentId) q = query(q, where('studentId', '==', filters.studentId))
    if (filters.date) q = query(q, where('date', '==', filters.date))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
  let orders = Object.values(getDb().orders || {})
  if (filters.outletId) orders = orders.filter((o) => o.outletId === filters.outletId)
  if (filters.studentId) orders = orders.filter((o) => o.studentId === filters.studentId)
  if (filters.date) orders = orders.filter((o) => o.date === filters.date)
  if (filters.status) orders = orders.filter((o) => o.status === filters.status)
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function subscribeOrders(cb, filters = {}) {
  if (useFirebase && db) {
    let q = collection(db, 'orders')
    if (filters.outletId) q = query(q, where('outletId', '==', filters.outletId))
    if (filters.studentId) q = query(q, where('studentId', '==', filters.studentId))
    return onSnapshot(q, (snap) => {
      let orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      if (filters.date) orders = orders.filter((o) => o.date === filters.date)
      cb(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    })
  }
  const emit = () => {
    listOrders(filters).then(cb)
  }
  emit()
  return subscribeDb(emit)
}

export async function getOrderByCode(orderCode, outletId = null) {
  const code = String(orderCode || '').trim().toUpperCase()
  if (useFirebase && db) {
    let q = query(collection(db, 'orders'), where('orderCode', '==', code))
    if (outletId) {
      q = query(q, where('outletId', '==', outletId))
    }
    const snap = await getDocs(q)
    if (snap.empty) return null
    const d = snap.docs[0]
    return { id: d.id, ...d.data() }
  }
  return (
    Object.values(getDb().orders || {}).find(
      (o) => o.orderCode === code && (!outletId || o.outletId === outletId),
    ) || null
  )
}

export async function updateOrderStatus(orderId, status, extra = {}) {
  if (useFirebase && db) {
    const payload = { status, ...extra }
    if (status === 'picked_up') {
      payload.pickedUpAt = new Date().toISOString()
    }
    await updateDoc(doc(db, 'orders', orderId), payload)
    return
  }
  patchDb((data) => {
    const order = data.orders?.[orderId]
    if (!order) throw new Error('Order not found')
    order.status = status
    Object.assign(order, extra)
    if (status === 'no_show') {
      const user = data.users?.[order.studentId]
      if (user) user.noShowCount = (user.noShowCount || 0) + 1
    }
    if (status === 'picked_up') {
      order.pickedUpAt = new Date().toISOString()
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid'
      }
    }
    return data
  })
}

export async function cancelOrder(orderId) {
  const orders = await listOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  if (!canCancelOrder(order)) throw new Error('Cancellation deadline has passed for this slot')
  await updateOrderStatus(orderId, 'cancelled')
  await releaseSlotSeat(order.slotId, order.outletId)
}

export async function markPrepared(orderId) {
  await updateOrderStatus(orderId, 'prepared')
}

export async function markPickedUp(orderId) {
  await updateOrderStatus(orderId, 'picked_up', {
    pickedUpAt: new Date().toISOString(),
  })
}

export async function flagNoShows(now = new Date(), outletId = null) {
  const orders = await listOrders({ date: todayKey(), ...(outletId ? { outletId } : {}) })
  const toFlag = orders.filter((o) => shouldFlagNoShow(o, now))
  await Promise.all(toFlag.map((o) => updateOrderStatus(o.id, 'no_show')))
  return toFlag.length
}

export function buildPrepQueue(orders) {
  const active = orders.filter((o) => ['pending', 'prepared'].includes(o.status))
  const map = {}
  active.forEach((o) => {
    o.items.forEach((it) => {
      const key = it.itemId || it.name
      if (!map[key]) {
        map[key] = {
          itemId: it.itemId,
          name: it.name,
          qty: 0,
          earliestSlot: o.slotTime,
          orderIds: [],
          orderItems: [],
        }
      }
      map[key].qty += it.qty
      map[key].orderIds.push(o.id)
      map[key].orderItems.push({ orderId: o.id, orderCode: o.orderCode, slotTime: o.slotTime, status: o.status })
      if (!map[key].earliestSlot || o.slotTime < map[key].earliestSlot) {
        map[key].earliestSlot = o.slotTime
      }
    })
  })
  return Object.values(map).sort((a, b) => a.earliestSlot.localeCompare(b.earliestSlot))
}
