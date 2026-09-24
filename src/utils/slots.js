import { addMinutes, format, parse, isBefore, isAfter } from 'date-fns'
import {
  CANTEEN_OPEN,
  CANTEEN_CLOSE,
  SLOT_MINUTES,
  CUTOFF_BEFORE_SLOT_MIN,
  DEFAULT_SLOT_CAPACITY,
  DEFAULT_OUTLET_ID,
  todayKey,
  uid,
} from './constants.js'

export function generateSlotsForDate(
  dateStr = todayKey(),
  outletId = DEFAULT_OUTLET_ID,
  maxCapacity = DEFAULT_SLOT_CAPACITY,
) {
  const base = parse(`${dateStr} ${CANTEEN_OPEN}`, 'yyyy-MM-dd HH:mm', new Date())
  const end = parse(`${dateStr} ${CANTEEN_CLOSE}`, 'yyyy-MM-dd HH:mm', new Date())
  const slots = []
  let cursor = base
  while (isBefore(cursor, end)) {
    const time = format(cursor, 'HH:mm')
    const slotEnd = addMinutes(cursor, SLOT_MINUTES)
    const cutoff = addMinutes(cursor, -CUTOFF_BEFORE_SLOT_MIN)
    slots.push({
      id: `${dateStr}_${outletId}_${time.replace(':', '')}`,
      outletId,
      time,
      date: dateStr,
      maxCapacity,
      bookedCount: 0,
      endTime: format(slotEnd, 'HH:mm'),
      cutoffTime: cutoff.toISOString(),
      slotStartIso: cursor.toISOString(),
      slotEndIso: slotEnd.toISOString(),
    })
    cursor = slotEnd
  }
  return slots
}

export function remainingCapacity(slot) {
  return Math.max((slot.maxCapacity || 0) - (slot.bookedCount || 0), 0)
}

export function canBookSlot(slot, now = new Date()) {
  if (remainingCapacity(slot) <= 0) return false
  const cutoff = new Date(slot.cutoffTime)
  return isBefore(now, cutoff)
}

export function canCancelOrder(order, now = new Date()) {
  if (!['pending', 'prepared'].includes(order.status)) return false
  return isBefore(now, new Date(order.cutoffTime))
}

export function shouldFlagNoShow(order, now = new Date()) {
  if (order.status !== 'prepared' && order.status !== 'pending') return false
  if (!order.slotEndIso) return false
  return isAfter(now, new Date(order.slotEndIso))
}

export function makeOrderCode() {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `QM${n}`
}

export function newOrderId() {
  return uid('ord')
}
