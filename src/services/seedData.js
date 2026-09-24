import { subDays, format, getDay } from 'date-fns'
import { DEMO_ACCOUNTS, todayKey, uid, CATEGORIES, DEFAULT_SLOT_CAPACITY } from '../utils/constants'
import { generateSlotsForDate } from '../utils/slots'
import { calcWaste } from '../utils/wasteCalc'

const MENU_SEED = [
  { name: 'Masala Dosa', price: 60, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1630387776932-8c1f4b0b8f5e?w=400&q=80' },
  { name: 'Idli Sambar', price: 40, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
  { name: 'Veg Thali', price: 90, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80' },
  { name: 'Chicken Biryani', price: 120, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { name: 'Paneer Wrap', price: 70, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80' },
  { name: 'Samosa Plate', price: 30, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { name: 'Filter Coffee', price: 25, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80' },
  { name: 'Fresh Lime Soda', price: 35, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80' },
]

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function buildSeedData() {
  const rand = rng(42)
  const users = {}
  const menuItems = {}
  const slots = {}
  const orders = {}
  const dailyStats = {}

  DEMO_ACCOUNTS.forEach((d, i) => {
    const id = `seed_${d.role}`
    users[id] = {
      uid: id,
      name: d.name,
      email: d.email,
      password: d.password,
      role: d.role,
      noShowCount: d.role === 'student' ? 2 : 0,
      totalOrders: d.role === 'student' ? 14 : 0,
      createdAt: new Date().toISOString(),
    }
  })

  // Extra students for no-show rate realism
  for (let i = 1; i <= 5; i++) {
    const id = `seed_student_${i}`
    users[id] = {
      uid: id,
      name: `Student ${i}`,
      email: `student${i}@qmeal.demo`,
      password: 'demo1234',
      role: 'student',
      noShowCount: i === 1 ? 4 : i % 3,
      totalOrders: 10 + i,
      createdAt: new Date().toISOString(),
    }
  }

  const today = todayKey()
  MENU_SEED.forEach((m, i) => {
    const id = `menu_${i + 1}`
    menuItems[id] = {
      id,
      ...m,
      isAvailable: true,
      date: today,
    }
  })

  // Slots for last 7 days + today
  for (let d = 0; d <= 7; d++) {
    const dateStr = format(subDays(new Date(), d === 0 ? 0 : d), 'yyyy-MM-dd')
    generateSlotsForDate(dateStr, DEFAULT_SLOT_CAPACITY).forEach((s) => {
      const booked = Math.floor(rand() * 12)
      slots[s.id] = { ...s, bookedCount: booked }
    })
  }

  const menuList = Object.values(menuItems)
  const studentIds = Object.values(users).filter((u) => u.role === 'student').map((u) => u.uid)

  // Historical + today orders
  for (let d = 0; d <= 7; d++) {
    const dateStr = format(subDays(new Date(), d), 'yyyy-MM-dd')
    const daySlots = Object.values(slots).filter((s) => s.date === dateStr)
    const ordersPerDay = 8 + Math.floor(rand() * 10)

    for (let o = 0; o < ordersPerDay; o++) {
      const slot = daySlots[Math.floor(rand() * daySlots.length)]
      if (!slot) continue
      const item = menuList[Math.floor(rand() * menuList.length)]
      const qty = 1 + Math.floor(rand() * 2)
      const studentId = studentIds[Math.floor(rand() * studentIds.length)]
      const payUpi = rand() > 0.45
      const id = uid('ord')
      const statuses =
        d === 0
          ? ['pending', 'prepared', 'picked_up']
          : ['picked_up', 'picked_up', 'picked_up', 'no_show', 'cancelled']
      const status = statuses[Math.floor(rand() * statuses.length)]

      orders[id] = {
        id,
        studentId,
        items: [{ itemId: item.id, name: item.name, qty, price: item.price }],
        slotId: slot.id,
        slotTime: slot.time,
        slotEndIso: slot.slotEndIso,
        totalAmount: item.price * qty,
        orderCode: `QM${100000 + Math.floor(rand() * 899999)}`,
        status,
        paymentMethod: payUpi ? 'upi' : 'cod',
        paymentStatus: payUpi ? 'paid' : status === 'picked_up' ? 'paid' : 'pending',
        transactionId: payUpi ? `TXN${Math.floor(rand() * 1e10)}` : null,
        cutoffTime: slot.cutoffTime,
        createdAt: new Date(`${dateStr}T${slot.time}:00`).toISOString(),
        date: dateStr,
      }
    }

    // dailyStats per item
    menuList.forEach((item) => {
      const dayOrders = Object.values(orders).filter(
        (ord) => ord.date === dateStr && ord.items.some((it) => it.itemId === item.id) && ord.status !== 'cancelled',
      )
      const preorders = dayOrders.reduce(
        (s, ord) => s + ord.items.filter((it) => it.itemId === item.id).reduce((a, it) => a + it.qty, 0),
        0,
      )
      const sold = dayOrders
        .filter((ord) => ord.status === 'picked_up')
        .reduce(
          (s, ord) => s + ord.items.filter((it) => it.itemId === item.id).reduce((a, it) => a + it.qty, 0),
          0,
        )
      const prepared = Math.max(sold + Math.floor(rand() * 4), preorders)
      const w = calcWaste({ prepared, sold })
      const key = `${dateStr}_${item.id}`
      dailyStats[key] = {
        id: key,
        itemId: item.id,
        itemName: item.name,
        date: dateStr,
        preorders,
        prepared,
        sold,
        unsold: w.unsold,
        wastePercent: w.wastePercent,
        mealsSaved: sold,
      }
    })
  }

  // Ensure a few live pending orders for demo
  const liveSlot = Object.values(slots).find((s) => s.date === today && s.time >= '12:00') || Object.values(slots).find((s) => s.date === today)
  if (liveSlot) {
    const item = menuList[2]
    const id = 'ord_demo_live'
    orders[id] = {
      id,
      studentId: 'seed_student',
      items: [{ itemId: item.id, name: item.name, qty: 2, price: item.price }],
      slotId: liveSlot.id,
      slotTime: liveSlot.time,
      slotEndIso: liveSlot.slotEndIso,
      totalAmount: item.price * 2,
      orderCode: 'QM424242',
      status: 'pending',
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      transactionId: 'TXNDEMO0001',
      cutoffTime: liveSlot.cutoffTime,
      createdAt: new Date().toISOString(),
      date: today,
    }
  }

  void CATEGORIES
  void getDay

  return { users, menuItems, slots, orders, dailyStats }
}
