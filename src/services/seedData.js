import { subDays, format } from 'date-fns'
import {
  DEMO_ACCOUNTS,
  OUTLETS,
  todayKey,
  uid,
  DEFAULT_SLOT_CAPACITY,
} from '../utils/constants.js'
import { generateSlotsForDate } from '../utils/slots.js'
import { calcWaste } from '../utils/wasteCalc.js'

export const MENU_SEED_BY_OUTLET = {
  'main-food-court': [
    { name: 'South Indian Thali', price: 110, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80', avgRating: 4.8, totalReviews: 42 },
    { name: 'North Indian Executive Thali', price: 140, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80', avgRating: 4.7, totalReviews: 38 },
    { name: 'Hyderabadi Chicken Dum Biryani', price: 130, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80', avgRating: 4.9, totalReviews: 54 },
    { name: 'Paneer Butter Masala Combo', price: 120, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', avgRating: 4.6, totalReviews: 29 },
    { name: 'Crispy Masala Dosa', price: 65, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1630387776932-8c1f4b0b8f5e?w=600&q=80', avgRating: 4.8, totalReviews: 60 },
    { name: 'Steamed Idli Sambar (3 Pcs)', price: 45, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80', avgRating: 4.5, totalReviews: 35 },
    { name: 'Poori Bhaji (3 Pcs)', price: 60, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', avgRating: 4.6, totalReviews: 24 },
    { name: 'Punjabi Chole Bhature', price: 90, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80', avgRating: 4.7, totalReviews: 31 },
    { name: 'Delhi Samosa Chaat', price: 45, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', avgRating: 4.7, totalReviews: 44 },
    { name: 'Mumbai Pav Bhaji', price: 75, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80', avgRating: 4.6, totalReviews: 27 },
    { name: 'Crispy Vegetable Cutlet', price: 35, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80', avgRating: 4.4, totalReviews: 18 },
    { name: 'Traditional Filter Coffee', price: 20, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', avgRating: 4.9, totalReviews: 68 },
    { name: 'Kesar Badam Milk', price: 35, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80', avgRating: 4.6, totalReviews: 22 },
    { name: 'Punjabi Sweet Lassi', price: 40, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600&q=80', avgRating: 4.7, totalReviews: 33 },
  ],
  aroma: [
    { name: 'Smoked Paneer Herb Panini', price: 110, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80', avgRating: 4.8, totalReviews: 28 },
    { name: 'Herb Roasted Chicken Sub', price: 135, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80', avgRating: 4.9, totalReviews: 40 },
    { name: 'Butter Croissant with Preserve', price: 85, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80', avgRating: 4.7, totalReviews: 25 },
    { name: 'Spinach & Sweet Corn Melt', price: 85, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&q=80', avgRating: 4.6, totalReviews: 19 },
    { name: 'Toasted Mushroom & Cheese Bagel', price: 95, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1585478259715-876a6a81ae08?w=600&q=80', avgRating: 4.5, totalReviews: 16 },
    { name: 'Dark Chocolate Babka', price: 75, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', avgRating: 4.9, totalReviews: 34 },
    { name: 'Wild Blueberry Muffin', price: 65, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&q=80', avgRating: 4.6, totalReviews: 21 },
    { name: 'Rosemary Garlic Focaccia', price: 60, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&q=80', avgRating: 4.7, totalReviews: 17 },
    { name: 'Spanish Iced Latte', price: 85, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80', avgRating: 4.9, totalReviews: 50 },
    { name: 'Caramel Macchiato', price: 95, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&q=80', avgRating: 4.8, totalReviews: 36 },
    { name: 'Japanese Matcha Green Tea Latte', price: 110, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80', avgRating: 4.7, totalReviews: 22 },
    { name: 'Fresh Cold-Pressed Valencia Orange Juice', price: 70, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80', avgRating: 4.8, totalReviews: 29 },
  ],
  brew: [
    { name: 'Classic Belgian Waffle with Berry Compote', price: 125, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80', avgRating: 4.9, totalReviews: 45 },
    { name: 'Nutella Hazelnut Loaded Waffle', price: 135, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80', avgRating: 4.9, totalReviews: 52 },
    { name: 'Avocado Tartine on Sourdough', price: 140, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80', avgRating: 4.6, totalReviews: 20 },
    { name: 'Signature Double Club Sandwich', price: 120, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&q=80', avgRating: 4.7, totalReviews: 31 },
    { name: 'Creamy Basil Pesto Penne', price: 130, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&q=80', avgRating: 4.8, totalReviews: 27 },
    { name: 'Cheesy Jalapeno Bites (6 Pcs)', price: 80, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&q=80', avgRating: 4.7, totalReviews: 33 },
    { name: 'Cinnamon Brioche French Toast', price: 95, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80', avgRating: 4.8, totalReviews: 24 },
    { name: 'Signature 18-Hour Cold Brew', price: 95, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80', avgRating: 4.9, totalReviews: 48 },
    { name: 'Nitro Cascara Sweet Cold Brew', price: 110, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80', avgRating: 4.9, totalReviews: 39 },
    { name: 'Roasted Hazelnut Frappe', price: 100, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80', avgRating: 4.8, totalReviews: 41 },
    { name: 'Hibiscus Passion Berry Iced Tea', price: 75, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', avgRating: 4.7, totalReviews: 26 },
    { name: 'Belgian Dark Chocolate Mocha Frappe', price: 105, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=600&q=80', avgRating: 4.9, totalReviews: 35 },
  ],
  'spice-corner': [
    { name: 'Paneer Tikka Kathi Roll', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80', avgRating: 4.8, totalReviews: 43 },
    { name: 'Chicken Malai Tikka Roll', price: 115, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80', avgRating: 4.9, totalReviews: 51 },
    { name: 'Egg Double Cheese Kathi Roll', price: 80, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80', avgRating: 4.7, totalReviews: 36 },
    { name: 'Mumbai Dahi Papdi Chaat', price: 55, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', avgRating: 4.8, totalReviews: 39 },
    { name: 'Crispy Sev Puri Special', price: 50, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', avgRating: 4.6, totalReviews: 28 },
    { name: 'Special Kolhapuri Bhel Puri', price: 45, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', avgRating: 4.5, totalReviews: 22 },
    { name: 'Ghee Roast Mysore Masala Dosa', price: 80, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1630387776932-8c1f4b0b8f5e?w=600&q=80', avgRating: 4.9, totalReviews: 47 },
    { name: 'Crispy Rava Onion Dosa', price: 75, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1630387776932-8c1f4b0b8f5e?w=600&q=80', avgRating: 4.7, totalReviews: 29 },
    { name: 'Amritsari Chole Kulche Plate', price: 85, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80', avgRating: 4.8, totalReviews: 37 },
    { name: 'Homestyle Rajma Chawal Bowl', price: 90, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80', avgRating: 4.8, totalReviews: 34 },
    { name: 'Kadhai Paneer with 2 Laccha Parathas', price: 120, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80', avgRating: 4.7, totalReviews: 25 },
    { name: 'Kulhad Ginger Masala Chai', price: 20, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', avgRating: 4.9, totalReviews: 65 },
    { name: 'Masala Spiced Chaas (Buttermilk)', price: 25, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600&q=80', avgRating: 4.6, totalReviews: 20 },
    { name: 'Alphonso Mango Lassi', price: 45, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600&q=80', avgRating: 4.8, totalReviews: 41 },
  ],
  bites: [
    { name: 'Crispy Fried Zinger Burger', price: 110, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', avgRating: 4.9, totalReviews: 58 },
    { name: 'Double Cheese Herb Veggie Burger', price: 95, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80', avgRating: 4.7, totalReviews: 44 },
    { name: 'Peri Peri Seasoned French Fries', price: 65, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&q=80', avgRating: 4.8, totalReviews: 50 },
    { name: 'Loaded Cheese & Jalapeno Nachos', price: 90, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80', avgRating: 4.7, totalReviews: 32 },
    { name: 'Crispy Chicken Popcorn Bucket', price: 120, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80', avgRating: 4.9, totalReviews: 49 },
    { name: 'Smoky BBQ Chicken Sub', price: 115, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80', avgRating: 4.8, totalReviews: 30 },
    { name: 'Tandoori Paneer Tortilla Wrap', price: 85, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80', avgRating: 4.6, totalReviews: 26 },
    { name: 'Crispy Butter Pepper Sweet Corn', price: 55, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&q=80', avgRating: 4.5, totalReviews: 18 },
    { name: 'Belgian Thick Chocolate Shake', price: 85, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80', avgRating: 4.9, totalReviews: 55 },
    { name: 'Oreo Mudslide Milkshake', price: 90, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=600&q=80', avgRating: 4.9, totalReviews: 47 },
    { name: 'Wild Strawberry Greek Yogurt Smoothie', price: 80, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80', avgRating: 4.7, totalReviews: 23 },
    { name: 'Electric Blue Curacao Mojito', price: 70, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80', avgRating: 4.8, totalReviews: 38 },
  ],
}

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function buildSeedData() {
  const rand = rng(101)
  const outlets = {}
  const users = {}
  const menuItems = {}
  const slots = {}
  const orders = {}
  const reviews = {}
  const dailyStats = {}

  // 1. Outlets
  OUTLETS.forEach((o) => {
    outlets[o.id] = { ...o }
  })

  // 2. Demo & Staff/Chef/Manager accounts
  DEMO_ACCOUNTS.forEach((d) => {
    const id = `seed_${d.role}_${d.outletId || 'default'}`
    users[id] = {
      uid: id,
      name: d.name,
      email: d.email,
      password: d.password,
      role: d.role,
      registrationNumber: d.registrationNumber || null,
      employeeId: d.employeeId || null,
      outletId: d.outletId || null,
      profilePictureUrl: null,
      phone: '9876543210',
      noShowCount: d.role === 'student' ? 1 : 0,
      totalOrders: d.role === 'student' ? 12 : 0,
      createdAt: new Date().toISOString(),
    }
  })

  // Extra staff/chef/managers for each outlet
  OUTLETS.forEach((out) => {
    if (out.id === 'main-food-court') return // already created in DEMO_ACCOUNTS
    const chefId = `seed_chef_${out.id}`
    const staffId = `seed_staff_${out.id}`
    const mgrId = `seed_manager_${out.id}`

    users[chefId] = {
      uid: chefId,
      name: `Chef of ${out.name}`,
      email: `chef.${out.id}@qmeal.demo`,
      password: 'demo1234',
      role: 'chef',
      employeeId: `EMP-CHF-${out.id.toUpperCase()}`,
      outletId: out.id,
      phone: '9876500001',
      noShowCount: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString(),
    }

    users[staffId] = {
      uid: staffId,
      name: `Staff of ${out.name}`,
      email: `staff.${out.id}@qmeal.demo`,
      password: 'demo1234',
      role: 'staff',
      employeeId: `EMP-STF-${out.id.toUpperCase()}`,
      outletId: out.id,
      phone: '9876500002',
      noShowCount: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString(),
    }

    users[mgrId] = {
      uid: mgrId,
      name: `Manager of ${out.name}`,
      email: `manager.${out.id}@qmeal.demo`,
      password: 'demo1234',
      role: 'manager',
      employeeId: `EMP-MGR-${out.id.toUpperCase()}`,
      outletId: out.id,
      phone: '9876500003',
      noShowCount: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString(),
    }
  })

  // 3. Extra student accounts for realism
  const sampleStudentNames = ['Riya Patel', 'Ananya Sen', 'Karthik Raja', 'Aditya Nair', 'Sneha Reddy', 'Vikram Singh']
  sampleStudentNames.forEach((name, idx) => {
    const id = `seed_student_${idx + 1}`
    users[id] = {
      uid: id,
      name,
      email: `student${idx + 1}@qmeal.demo`,
      password: 'demo1234',
      role: 'student',
      registrationNumber: `22BCE10${idx + 10}`,
      outletId: null,
      phone: `987651000${idx}`,
      noShowCount: idx === 0 ? 3 : idx % 2,
      totalOrders: 15 + idx * 3,
      createdAt: new Date().toISOString(),
    }
  })

  // 4. Menu items per outlet
  const today = todayKey()
  OUTLETS.forEach((out) => {
    const items = MENU_SEED_BY_OUTLET[out.id] || []
    items.forEach((item, idx) => {
      const itemId = `menu_${out.id}_${idx + 1}`
      menuItems[itemId] = {
        id: itemId,
        outletId: out.id,
        name: item.name,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        avgRating: item.avgRating,
        totalReviews: item.totalReviews,
        isAvailable: true,
        date: today,
      }
    })
  })

  // 5. Slots for past 7 days + today for all 5 outlets
  for (let d = 0; d <= 7; d++) {
    const dateStr = format(subDays(new Date(), d), 'yyyy-MM-dd')
    OUTLETS.forEach((out) => {
      const daySlots = generateSlotsForDate(dateStr, out.id, DEFAULT_SLOT_CAPACITY)
      daySlots.forEach((s) => {
        const booked = Math.floor(rand() * 12)
        slots[s.id] = { ...s, bookedCount: booked }
      })
    })
  }

  const studentList = Object.values(users).filter((u) => u.role === 'student')

  // Sample review comments
  const positiveComments = [
    'Super fast pickup and food was piping hot!',
    'Loved the taste! Fresh ingredients and great quality.',
    'Skip the queue feature is a lifesaver between lectures.',
    'Amazing presentation and rich flavor. Highly recommend!',
    'Great portion size, value for money!',
  ]

  // 6. 7-day Historical and Today's Orders per Outlet
  OUTLETS.forEach((out) => {
    const outMenuItems = Object.values(menuItems).filter((m) => m.outletId === out.id)

    for (let d = 0; d <= 7; d++) {
      const dateStr = format(subDays(new Date(), d), 'yyyy-MM-dd')
      const daySlots = Object.values(slots).filter((s) => s.date === dateStr && s.outletId === out.id)
      if (!daySlots.length || !outMenuItems.length) continue

      const ordersCount = 7 + Math.floor(rand() * 9)

      for (let o = 0; o < ordersCount; o++) {
        const slot = daySlots[Math.floor(rand() * daySlots.length)]
        const item = outMenuItems[Math.floor(rand() * outMenuItems.length)]
        const qty = 1 + Math.floor(rand() * 2)
        const student = studentList[Math.floor(rand() * studentList.length)]
        const payRazorpay = rand() > 0.4
        const id = uid('ord')

        const statuses =
          d === 0
            ? ['pending', 'prepared', 'picked_up', 'picked_up']
            : ['picked_up', 'picked_up', 'picked_up', 'no_show', 'cancelled']
        const status = statuses[Math.floor(rand() * statuses.length)]

        const paymentStatus =
          payRazorpay || status === 'picked_up'
            ? 'paid'
            : status === 'cancelled'
              ? 'refunded'
              : 'pending'

        orders[id] = {
          id,
          studentId: student.uid,
          outletId: out.id,
          items: [{ itemId: item.id, name: item.name, qty, price: item.price }],
          slotId: slot.id,
          slotTime: slot.time,
          slotEndIso: slot.slotEndIso,
          totalAmount: item.price * qty,
          orderCode: `QM${100000 + Math.floor(rand() * 899999)}`,
          status,
          paymentMethod: payRazorpay ? 'razorpay' : 'cod',
          paymentStatus,
          razorpayPaymentId: payRazorpay ? `pay_test_${Math.floor(rand() * 1e12)}` : null,
          cutoffTime: slot.cutoffTime,
          createdAt: new Date(`${dateStr}T${slot.time}:00`).toISOString(),
          date: dateStr,
        }

        // Add reviews for completed historical orders
        if (status === 'picked_up' && rand() > 0.35) {
          const revId = uid('rev')
          const rating = 4 + (rand() > 0.4 ? 1 : 0)
          reviews[revId] = {
            id: revId,
            orderId: id,
            itemId: item.id,
            itemName: item.name,
            outletId: out.id,
            studentId: student.uid,
            studentName: student.name,
            rating,
            comment: positiveComments[Math.floor(rand() * positiveComments.length)],
            createdAt: new Date(`${dateStr}T${slot.time}:00`).toISOString(),
          }
        }
      }

      // 7. Daily Stats per Menu Item per Outlet
      outMenuItems.forEach((item) => {
        const itemOrders = Object.values(orders).filter(
          (ord) =>
            ord.date === dateStr &&
            ord.outletId === out.id &&
            ord.items.some((it) => it.itemId === item.id) &&
            ord.status !== 'cancelled',
        )

        const preorders = itemOrders.reduce(
          (s, ord) => s + ord.items.filter((it) => it.itemId === item.id).reduce((a, it) => a + it.qty, 0),
          0,
        )

        const sold = itemOrders
          .filter((ord) => ord.status === 'picked_up')
          .reduce(
            (s, ord) => s + ord.items.filter((it) => it.itemId === item.id).reduce((a, it) => a + it.qty, 0),
            0,
          )

        const prepared = Math.max(sold + Math.floor(rand() * 3), preorders)
        const w = calcWaste({ prepared, sold })
        const statKey = `${dateStr}_${out.id}_${item.id}`

        dailyStats[statKey] = {
          id: statKey,
          outletId: out.id,
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
  })

  // 8. Ensure live pending orders for all outlets today for demo
  OUTLETS.forEach((out, idx) => {
    const outSlots = Object.values(slots).filter((s) => s.date === today && s.outletId === out.id)
    const outMenuItems = Object.values(menuItems).filter((m) => m.outletId === out.id)
    if (!outSlots.length || !outMenuItems.length) return

    const liveSlot = outSlots.find((s) => s.time >= '12:00') || outSlots[0]
    const item = outMenuItems[0]
    const id = `ord_live_${out.id}`

    orders[id] = {
      id,
      studentId: 'seed_student_default',
      outletId: out.id,
      items: [{ itemId: item.id, name: item.name, qty: 2, price: item.price }],
      slotId: liveSlot.id,
      slotTime: liveSlot.time,
      slotEndIso: liveSlot.slotEndIso,
      totalAmount: item.price * 2,
      orderCode: `QM${400000 + idx * 11111}`,
      status: 'pending',
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      razorpayPaymentId: `pay_test_live_${idx + 100}`,
      cutoffTime: liveSlot.cutoffTime,
      createdAt: new Date().toISOString(),
      date: today,
    }
  })

  return { outlets, users, menuItems, slots, orders, reviews, dailyStats }
}
