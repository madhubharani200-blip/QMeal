/**
 * Rule-based demand forecast (NOT ML).
 * predictedDemand = 0.5*last7SameWeekday + 0.3*last3Avg + 0.2*currentPreorders
 * adjustedForNoShow = predicted * (1 - avgNoShowRate)
 * recommendedPrep = ceil(adjusted * 1.05)
 * Fallback (no history): currentPreorders * 1.2
 */
export function forecastItem({
  currentPreorders = 0,
  sameWeekdayHistory = [],
  last3DayHistory = [],
  avgNoShowRate = 0,
}) {
  const hasHistory = sameWeekdayHistory.length > 0 || last3DayHistory.length > 0

  let predictedDemand
  if (!hasHistory) {
    predictedDemand = currentPreorders * 1.2
  } else {
    const sameWeekdayAvg =
      sameWeekdayHistory.length > 0
        ? sameWeekdayHistory.reduce((a, b) => a + b, 0) / sameWeekdayHistory.length
        : currentPreorders
    const last3Avg =
      last3DayHistory.length > 0
        ? last3DayHistory.reduce((a, b) => a + b, 0) / last3DayHistory.length
        : currentPreorders
    predictedDemand = sameWeekdayAvg * 0.5 + last3Avg * 0.3 + currentPreorders * 0.2
  }

  const rate = Math.min(Math.max(avgNoShowRate, 0), 0.5)
  const adjustedForNoShow = predictedDemand * (1 - rate)
  const recommendedPreparation = Math.ceil(adjustedForNoShow * 1.05)

  return {
    currentPreorders,
    predictedDemand: Math.round(predictedDemand * 10) / 10,
    adjustedForNoShow: Math.round(adjustedForNoShow * 10) / 10,
    recommendedPreparation,
    avgNoShowRate: rate,
    method: hasHistory ? 'weightedAverage' : 'fallback',
  }
}

export function avgNoShowRate(users = []) {
  const students = users.filter((u) => u.role === 'student')
  if (!students.length) return 0.08
  const rates = students.map((u) => {
    const total = u.totalOrders || 0
    if (total === 0) return 0
    return (u.noShowCount || 0) / total
  })
  return rates.reduce((a, b) => a + b, 0) / rates.length
}
