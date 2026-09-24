import { subDays, format, getDay } from 'date-fns'
import { listOrders } from './orderService'
import { listMenu } from './menuService'
import { getDb, patchDb, subscribeDb } from './localDb'
import { useFirebase, db } from './firebase'
import { collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore'
import { forecastItem, avgNoShowRate } from '../utils/forecastLogic'
import { calcWaste } from '../utils/wasteCalc'
import { todayKey, DEFAULT_OUTLET_ID } from '../utils/constants'

export async function listUsers() {
  if (useFirebase && db) {
    const snap = await getDocs(collection(db, 'users'))
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
  }
  return Object.values(getDb().users || {}).map(({ password: _, ...u }) => u)
}

export async function listDailyStats(filters = {}) {
  if (useFirebase && db) {
    let q = collection(db, 'dailyStats')
    if (filters.outletId) q = query(q, where('outletId', '==', filters.outletId))
    if (filters.date) q = query(q, where('date', '==', filters.date))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
  let stats = Object.values(getDb().dailyStats || {})
  if (filters.outletId) stats = stats.filter((s) => s.outletId === filters.outletId)
  if (filters.date) stats = stats.filter((s) => s.date === filters.date)
  return stats
}

export function subscribeDailyStats(cb, filters = {}) {
  const emit = () => {
    listDailyStats(filters).then(cb)
  }
  emit()
  return subscribeDb(emit)
}

export async function upsertDailyStat(stat) {
  const prepared = Number(stat.prepared || 0)
  const sold = Number(stat.sold || 0)
  const waste = calcWaste({ prepared, sold })
  const outletId = stat.outletId || DEFAULT_OUTLET_ID
  const statKey = `${stat.date}_${outletId}_${stat.itemId}`

  const payload = {
    ...stat,
    outletId,
    prepared,
    sold,
    ...waste,
    mealsSaved: sold,
    id: statKey,
  }

  if (useFirebase && db) {
    await setDoc(doc(db, 'dailyStats', statKey), payload, { merge: true })
    return payload
  }

  patchDb((data) => {
    if (!data.dailyStats) data.dailyStats = {}
    data.dailyStats[statKey] = payload
    return data
  })
  return payload
}

export async function buildForecastTable(date = todayKey(), outletId = DEFAULT_OUTLET_ID) {
  const [menu, orders, stats, users] = await Promise.all([
    listMenu({ outletId }),
    listOrders({ outletId }),
    listDailyStats({ outletId }),
    listUsers(),
  ])

  const noShow = avgNoShowRate(users)
  const todayOrders = orders.filter(
    (o) => o.date === date && !['cancelled'].includes(o.status),
  )
  const weekday = getDay(new Date(`${date}T12:00:00`))

  return menu
    .filter((m) => m.isAvailable !== false)
    .map((item) => {
      const currentPreorders = todayOrders.reduce(
        (s, o) =>
          s + o.items.filter((it) => it.itemId === item.id).reduce((a, it) => a + it.qty, 0),
        0,
      )

      const sameWeekdayHistory = []
      for (let i = 1; i <= 7; i++) {
        const d = format(subDays(new Date(`${date}T12:00:00`), i), 'yyyy-MM-dd')
        if (getDay(new Date(`${d}T12:00:00`)) !== weekday) continue
        const st = stats.find((x) => x.date === d && x.itemId === item.id)
        if (st) sameWeekdayHistory.push(st.preorders || 0)
      }

      const last3DayHistory = [1, 2, 3].map((i) => {
        const d = format(subDays(new Date(`${date}T12:00:00`), i), 'yyyy-MM-dd')
        const st = stats.find((x) => x.date === d && x.itemId === item.id)
        return st?.preorders || 0
      })

      const f = forecastItem({
        currentPreorders,
        sameWeekdayHistory,
        last3DayHistory,
        avgNoShowRate: noShow,
      })

      return {
        itemId: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        ...f,
      }
    })
}

export function computePaymentAnalytics(orders = []) {
  const cod = orders.filter((o) => o.paymentMethod === 'cod')
  const razorpay = orders.filter((o) => o.paymentMethod === 'razorpay')
  const collected = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((s, o) => s + (o.totalAmount || 0), 0)
  const pending = orders
    .filter((o) => o.paymentStatus === 'pending')
    .reduce((s, o) => s + (o.totalAmount || 0), 0)

  return {
    codCount: cod.length,
    razorpayCount: razorpay.length,
    codAmount: cod.reduce((s, o) => s + (o.totalAmount || 0), 0),
    razorpayAmount: razorpay.reduce((s, o) => s + (o.totalAmount || 0), 0),
    collected,
    pending,
    totalRevenue: collected + pending,
  }
}
