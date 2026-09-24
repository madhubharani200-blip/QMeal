import { subDays, format, getDay } from 'date-fns'
import { listOrders } from './orderService'
import { listMenu } from './menuService'
import { getDb, patchDb, subscribeDb } from './localDb'
import { useFirebase, db } from './firebase'
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'
import { forecastItem, avgNoShowRate } from '../utils/forecastLogic'
import { calcWaste } from '../utils/wasteCalc'
import { todayKey } from '../utils/constants'

export async function listUsers() {
  if (useFirebase) {
    const snap = await getDocs(collection(db, 'users'))
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
  }
  return Object.values(getDb().users).map(({ password: _, ...u }) => u)
}

export async function listDailyStats() {
  if (useFirebase) {
    const snap = await getDocs(collection(db, 'dailyStats'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
  return Object.values(getDb().dailyStats)
}

export function subscribeDailyStats(cb) {
  if (useFirebase) {
    return getDocs(collection(db, 'dailyStats')).then((snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
  }
  const emit = () => cb(Object.values(getDb().dailyStats))
  emit()
  return subscribeDb(emit)
}

export async function upsertDailyStat(stat) {
  const waste = calcWaste({ prepared: stat.prepared, sold: stat.sold })
  const payload = {
    ...stat,
    ...waste,
    mealsSaved: waste.sold,
    id: `${stat.date}_${stat.itemId}`,
  }
  if (useFirebase) {
    await setDoc(doc(db, 'dailyStats', payload.id), payload, { merge: true })
    return payload
  }
  patchDb((data) => {
    data.dailyStats[payload.id] = { ...data.dailyStats[payload.id], ...payload }
    return data
  })
  return payload
}

export async function buildForecastTable(date = todayKey()) {
  const [menu, orders, stats, users] = await Promise.all([
    listMenu(),
    listOrders(),
    listDailyStats(),
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
        ...f,
      }
    })
}

export async function paymentAnalytics(orders) {
  const list = orders || (await listOrders())
  const cod = list.filter((o) => o.paymentMethod === 'cod')
  const upi = list.filter((o) => o.paymentMethod === 'upi')
  const collected = list
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((s, o) => s + (o.totalAmount || 0), 0)
  const pending = list
    .filter((o) => o.paymentStatus === 'pending')
    .reduce((s, o) => s + (o.totalAmount || 0), 0)
  return {
    codCount: cod.length,
    upiCount: upi.length,
    codAmount: cod.reduce((s, o) => s + (o.totalAmount || 0), 0),
    upiAmount: upi.reduce((s, o) => s + (o.totalAmount || 0), 0),
    collected,
    pending,
  }
}
