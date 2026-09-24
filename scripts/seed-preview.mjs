/**
 * Node-friendly seed preview — the live app seeds via src/services/seedData.js
 * into localStorage on first load. This script prints summary counts for judges/docs.
 */
import { buildSeedData } from '../src/services/seedData.js'

const data = buildSeedData()
console.log('QMeal seed summary')
console.log('users', Object.keys(data.users).length)
console.log('menuItems', Object.keys(data.menuItems).length)
console.log('slots', Object.keys(data.slots).length)
console.log('orders', Object.keys(data.orders).length)
console.log('dailyStats', Object.keys(data.dailyStats).length)
console.log('COD orders', Object.values(data.orders).filter((o) => o.paymentMethod === 'cod').length)
console.log('Razorpay orders', Object.values(data.orders).filter((o) => o.paymentMethod === 'razorpay').length)
