export function calcWaste({ prepared = 0, sold = 0 }) {
  const unsold = Math.max(prepared - sold, 0)
  const wastePercent = prepared > 0 ? (unsold / prepared) * 100 : 0
  return {
    prepared,
    sold,
    unsold,
    wastePercent: Math.round(wastePercent * 10) / 10,
  }
}

/** Meals that didn't go to waste because of accurate forecasting / on-time pickup */
export function mealsSavedFromStats(dailyStats = []) {
  return dailyStats.reduce((sum, s) => sum + (s.mealsSaved || s.sold || 0), 0)
}

export function mealsSavedFromOrders(orders = []) {
  return orders.filter((o) => o.status === 'picked_up').length
}
