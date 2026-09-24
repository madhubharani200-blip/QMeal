import { useEffect, useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import { PreparedSoldChart, WasteTrendChart, PaymentsPie } from '../components/Charts'
import RatingStars from '../components/RatingStars'
import { useAuth } from '../hooks/useAuth'
import { useOutlet } from '../hooks/useOutlet'
import { useMenu } from '../hooks/useMenu'
import { useOrders } from '../hooks/useOrders'
import {
  buildForecastTable,
  listDailyStats,
  upsertDailyStat,
  computePaymentAnalytics,
} from '../services/forecastService'
import { upsertMenuItem, deleteMenuItem, toggleMenuAvailability } from '../services/menuService'
import { listSlots, updateSlotCapacity, ensureSlots } from '../services/slotService'
import { listReviews } from '../services/reviewService'
import { todayKey, formatINR, CATEGORIES, DEFAULT_SLOT_CAPACITY } from '../utils/constants'
import {
  TrendingUp,
  Leaf,
  DollarSign,
  Utensils,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info,
  Star,
  Users,
  Clock,
  Save,
  MessageSquare,
} from 'lucide-react'

const TABS = [
  { id: 'forecast', label: 'Demand Forecasting' },
  { id: 'waste', label: 'Waste Analytics & Logger' },
  { id: 'menu', label: 'Menu Management' },
  { id: 'slots', label: 'Slot Capacity' },
  { id: 'reviews', label: 'Ratings & Reviews' },
  { id: 'charts', label: 'Visual Analytics' },
]

export default function ManagerDashboard() {
  const { user } = useAuth()
  const { currentOutlet } = useOutlet()
  const outletId = user?.outletId || currentOutlet?.id

  const [activeTab, setActiveTab] = useState('forecast')
  const { menu, loading: menuLoading } = useMenu({ outletId })
  const { orders } = useOrders({ outletId })
  const [stats, setStats] = useState([])
  const [forecastRows, setForecastRows] = useState([])
  const [slots, setSlots] = useState([])
  const [reviews, setReviews] = useState([])

  // Modal / Form States
  const [editItem, setEditItem] = useState(null)
  const [itemForm, setItemForm] = useState({
    name: '',
    price: 60,
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
  })
  const [wasteForm, setWasteForm] = useState({})
  const [slotCapacityInput, setSlotCapacityInput] = useState({})
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  // Load Data for current outlet
  const loadData = async () => {
    try {
      const [forecast, daily, slotList, revs] = await Promise.all([
        buildForecastTable(todayKey(), outletId),
        listDailyStats({ outletId }),
        listSlots(todayKey(), outletId),
        listReviews({ outletId }),
      ])
      setForecastRows(forecast)
      setStats(daily)
      setSlots(slotList)
      setReviews(revs)
    } catch (e) {
      console.error('Error loading manager data:', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [outletId, menu, orders])

  // KPIs
  const totalMealsSaved = useMemo(() => {
    return stats.reduce((s, x) => s + (x.mealsSaved || x.sold || 0), 0)
  }, [stats])

  const avgWastePercent = useMemo(() => {
    if (!stats.length) return 4.2
    const totalPrepared = stats.reduce((s, x) => s + (x.prepared || 0), 0)
    const totalUnsold = stats.reduce((s, x) => s + (x.unsold || 0), 0)
    return totalPrepared > 0 ? Math.round((totalUnsold / totalPrepared) * 1000) / 10 : 0
  }, [stats])

  const paymentData = useMemo(() => computePaymentAnalytics(orders), [orders])

  // Prepared vs Sold chart data
  const preparedVsSoldData = useMemo(() => {
    return forecastRows.slice(0, 7).map((f) => {
      const st = stats.find((x) => x.date === todayKey() && x.itemId === f.itemId)
      return {
        name: f.name.length > 12 ? f.name.slice(0, 12) + '…' : f.name,
        prepared: st?.prepared || f.recommendedPreparation,
        sold: st?.sold || f.currentPreorders,
        unsold: st?.unsold || Math.max(0, f.recommendedPreparation - f.currentPreorders),
      }
    })
  }, [forecastRows, stats])

  // 7-day waste trend data
  const wasteTrendData = useMemo(() => {
    const dates = [...new Set(stats.map((s) => s.date))].sort()
    return dates.slice(-7).map((d) => {
      const dayStats = stats.filter((s) => s.date === d)
      const prep = dayStats.reduce((s, x) => s + (x.prepared || 0), 0)
      const uns = dayStats.reduce((s, x) => s + (x.unsold || 0), 0)
      const wastePct = prep > 0 ? Math.round((uns / prep) * 1000) / 10 : 0
      return {
        date: d.slice(5),
        wastePercent: wastePct,
      }
    })
  }, [stats])

  // Save / Update Menu Item
  const handleSaveItem = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await upsertMenuItem({
        ...(editItem?.id ? { id: editItem.id } : {}),
        ...itemForm,
        outletId,
        price: Number(itemForm.price),
      })
      setEditItem(null)
      setItemForm({
        name: '',
        price: 60,
        category: 'Lunch',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
      })
      setMsg('Menu item saved successfully!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to save menu item')
    }
  }

  // Delete Menu Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return
    try {
      await deleteMenuItem(id)
    } catch (err) {
      setError(err.message)
    }
  }

  // Log Daily Waste for an item
  const handleLogWaste = async (itemId, itemName) => {
    const vals = wasteForm[itemId] || {}
    const prepared = Number(vals.prepared || 0)
    const sold = Number(vals.sold || 0)
    if (prepared === 0 && sold === 0) return

    try {
      await upsertDailyStat({
        date: todayKey(),
        outletId,
        itemId,
        itemName,
        prepared,
        sold,
      })
      setMsg(`Waste log updated for ${itemName}!`)
      setTimeout(() => setMsg(''), 3000)
      loadData()
    } catch (err) {
      setError(err.message || 'Failed to log waste')
    }
  }

  // Update Slot Max Capacity
  const handleUpdateSlot = async (slotId) => {
    const cap = slotCapacityInput[slotId]
    if (!cap) return
    try {
      await updateSlotCapacity(slotId, cap)
      setMsg('Slot capacity updated!')
      setTimeout(() => setMsg(''), 3000)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AppShell
      title={`Management Dashboard · ${currentOutlet?.name || 'Outlet'}`}
      nav={[{ to: '/manager', label: 'Outlet Overview', end: true }]}
    >
      <div className="space-y-8">
        {/* Top Hero KPI Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/80 to-stone-900 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Leaf className="h-4 w-4" />
              <span>Meals Saved</span>
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {totalMealsSaved}
            </div>
            <p className="text-[11px] text-emerald-300 mt-0.5">Preorder-driven waste prevention</p>
          </div>

          <div className="rounded-3xl border border-amber-500/30 bg-stone-900/90 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <TrendingUp className="h-4 w-4" />
              <span>Avg Food Waste</span>
            </div>
            <div className="mt-2 text-3xl font-black text-amber-300 font-mono">
              {avgWastePercent}%
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">Industry avg: 18–25%</p>
          </div>

          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <DollarSign className="h-4 w-4" />
              <span>Revenue (Collected)</span>
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {formatINR(paymentData.collected)}
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">Pending COD: {formatINR(paymentData.pending)}</p>
          </div>

          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl backdrop-blur">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-300">
              <Utensils className="h-4 w-4 text-emerald-400" />
              <span>Total Orders</span>
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {orders.length}
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">{menu.length} active menu items</p>
          </div>
        </div>

        {/* Global Notifications */}
        {msg && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'border border-stone-800 bg-stone-900/80 text-stone-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DEMAND FORECASTING TABLE */}
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Info className="h-4 w-4" />
                <span>Explainable Rule-Based Forecasting Formula</span>
              </div>
              <p className="mt-1 text-xs text-stone-300 leading-relaxed font-mono">
                predictedDemand = (last7DaysSameWeekday × 0.5) + (last3DaysAverage × 0.3) + (currentPreorders × 0.2)
                <br />
                recommendedPrep = ceil(predictedDemand × (1 - noShowRate) × 1.05 safety buffer)
              </p>
              <span className="mt-1 inline-block text-[11px] text-amber-300 font-sans font-medium">
                *Statistical explainable forecast model (Transparent algorithm, no opaque ML claims).
              </span>
            </div>

            <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/90 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-800 bg-stone-950/80 text-stone-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Food Item</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5 text-center">Live Preorders</th>
                      <th className="px-5 py-3.5 text-center">Predicted Demand</th>
                      <th className="px-5 py-3.5 text-center">Recommended Preparation</th>
                      <th className="px-5 py-3.5 text-right">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {forecastRows.map((row) => (
                      <tr key={row.itemId} className="hover:bg-stone-800/30 transition">
                        <td className="px-5 py-4 font-bold text-white text-sm">{row.name}</td>
                        <td className="px-5 py-4 text-stone-400">{row.category}</td>
                        <td className="px-5 py-4 text-center font-mono text-cyan-400 font-bold">
                          {row.currentPreorders}
                        </td>
                        <td className="px-5 py-4 text-center font-mono text-amber-400 font-bold">
                          {row.predictedDemand}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center rounded-xl bg-emerald-950 px-3 py-1 text-emerald-300 font-mono text-sm font-black border border-emerald-800/60">
                            {row.recommendedPreparation} units
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="rounded-md bg-stone-800 px-2 py-0.5 text-[10px] text-stone-400 font-mono">
                            {row.method}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WASTE ANALYTICS & LOGGER */}
        {activeTab === 'waste' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Daily Kitchen Production & Waste Logger</h3>
                <p className="text-xs text-stone-400">
                  Enter actual quantities prepared and sold today. Waste % and meals saved are computed automatically.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/90 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-800 bg-stone-950/80 text-stone-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Food Item</th>
                      <th className="px-5 py-3.5 text-center">Preorders</th>
                      <th className="px-5 py-3.5">Prepared Qty</th>
                      <th className="px-5 py-3.5">Sold Qty</th>
                      <th className="px-5 py-3.5 text-center">Unsold Waste</th>
                      <th className="px-5 py-3.5 text-center">Waste %</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {forecastRows.map((row) => {
                      const st = stats.find((x) => x.date === todayKey() && x.itemId === row.itemId)
                      const formVals = wasteForm[row.itemId] || {
                        prepared: st?.prepared || row.recommendedPreparation,
                        sold: st?.sold || row.currentPreorders,
                      }

                      return (
                        <tr key={row.itemId} className="hover:bg-stone-800/30 transition">
                          <td className="px-5 py-4 font-bold text-white">{row.name}</td>
                          <td className="px-5 py-4 text-center font-mono text-cyan-400">{row.currentPreorders}</td>

                          <td className="px-5 py-4">
                            <input
                              type="number"
                              value={formVals.prepared}
                              onChange={(e) =>
                                setWasteForm({
                                  ...wasteForm,
                                  [row.itemId]: { ...formVals, prepared: e.target.value },
                                })
                              }
                              className="w-20 rounded-lg border border-stone-700 bg-stone-950 p-1.5 text-xs text-white font-mono text-center outline-none focus:border-emerald-500"
                            />
                          </td>

                          <td className="px-5 py-4">
                            <input
                              type="number"
                              value={formVals.sold}
                              onChange={(e) =>
                                setWasteForm({
                                  ...wasteForm,
                                  [row.itemId]: { ...formVals, sold: e.target.value },
                                })
                              }
                              className="w-20 rounded-lg border border-stone-700 bg-stone-950 p-1.5 text-xs text-white font-mono text-center outline-none focus:border-emerald-500"
                            />
                          </td>

                          <td className="px-5 py-4 text-center font-mono font-bold text-amber-400">
                            {st ? st.unsold : Math.max(0, formVals.prepared - formVals.sold)}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-mono font-bold ${
                                (st?.wastePercent || 0) > 15
                                  ? 'bg-rose-950 text-rose-300'
                                  : 'bg-emerald-950 text-emerald-300'
                              }`}
                            >
                              {st ? `${st.wastePercent}%` : '—'}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleLogWaste(row.itemId, row.name)}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-white shadow hover:bg-emerald-500 transition"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>Log</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white">Menu Item Configuration</h3>
              <button
                type="button"
                onClick={() => {
                  setEditItem({})
                  setItemForm({
                    name: '',
                    price: 70,
                    category: 'Lunch',
                    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
                  })
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Food Item</span>
              </button>
            </div>

            {/* Edit / Add Modal Form */}
            {editItem && (
              <form
                onSubmit={handleSaveItem}
                className="rounded-3xl border border-emerald-500/40 bg-stone-900 p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h4 className="text-sm font-bold text-white">
                    {editItem.id ? `Edit: ${editItem.name}` : 'Add New Menu Item'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="text-xs text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-300">Item Name</label>
                    <input
                      required
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-300">Price in INR (₹)</label>
                    <input
                      required
                      type="number"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-300">Category</label>
                    <select
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-stone-900">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-stone-300">Image URL</label>
                    <input
                      required
                      value={itemForm.imageUrl}
                      onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                      className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditItem(null)}
                    className="rounded-xl border border-stone-700 px-4 py-2 text-xs font-bold text-stone-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    Save Item
                  </button>
                </div>
              </form>
            )}

            {/* Menu List Table */}
            <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/90 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-800 bg-stone-950/80 text-stone-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Item</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Price</th>
                      <th className="px-5 py-3.5">Rating</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {menu.map((it) => (
                      <tr key={it.id} className="hover:bg-stone-800/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={it.imageUrl} alt={it.name} className="h-9 w-9 rounded-xl object-cover" />
                            <span className="font-bold text-white">{it.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-stone-400">{it.category}</td>
                        <td className="px-5 py-3.5 font-mono font-bold text-white">{formatINR(it.price)}</td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1 font-bold text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {Number(it.avgRating || 4.7).toFixed(1)} ({it.totalReviews || 10})
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => toggleMenuAvailability(it.id, it.isAvailable === false)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              it.isAvailable !== false
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                                : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                            }`}
                          >
                            {it.isAvailable !== false ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditItem(it)
                              setItemForm({
                                name: it.name,
                                price: it.price,
                                category: it.category,
                                imageUrl: it.imageUrl,
                              })
                            }}
                            className="rounded-lg border border-stone-700 p-1.5 text-stone-300 hover:bg-stone-800"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(it.id)}
                            className="rounded-lg border border-rose-900/60 p-1.5 text-rose-400 hover:bg-rose-950"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SLOT CAPACITY */}
        {activeTab === 'slots' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">15-Minute Slot Capacity Configuration</h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-h-96 overflow-y-auto pr-1">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900/90 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-white">{s.time}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{s.bookedCount || 0} booked</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      defaultValue={s.maxCapacity || DEFAULT_SLOT_CAPACITY}
                      onChange={(e) =>
                        setSlotCapacityInput({ ...slotCapacityInput, [s.id]: e.target.value })
                      }
                      className="w-14 rounded-lg border border-stone-700 bg-stone-950 p-1 text-xs text-white text-center font-mono outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateSlot(s.id)}
                      className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                    >
                      Set
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RATINGS & REVIEWS OVERVIEW */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Rated Items */}
              <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-emerald-400" />
                  <span>Top-Rated Items in {currentOutlet?.name}</span>
                </h4>
                <div className="divide-y divide-stone-800/60 text-xs">
                  {menu
                    .slice()
                    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
                    .slice(0, 5)
                    .map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-2.5">
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="flex items-center gap-1 font-mono font-bold text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {Number(m.avgRating || 4.8).toFixed(1)} ({m.totalReviews || 12})
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Quality Attention Items */}
              <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  <span>Items Needing Recipe / Prep Attention</span>
                </h4>
                <div className="divide-y divide-stone-800/60 text-xs">
                  {menu
                    .slice()
                    .sort((a, b) => (a.avgRating || 5) - (b.avgRating || 5))
                    .slice(0, 5)
                    .map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-2.5">
                        <span className="text-stone-300">{m.name}</span>
                        <span className="flex items-center gap-1 font-mono font-bold text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {Number(m.avgRating || 4.5).toFixed(1)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Recent Reviews List */}
            <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>Verified Student Feedback ({reviews.length})</span>
              </h4>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{r.itemName}</span>
                      <RatingStars value={r.rating} readOnly size={12} />
                    </div>
                    {r.comment && <p className="text-xs text-stone-300 italic">"{r.comment}"</p>}
                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-800/60">
                      <span>{r.studentName || 'Student'}</span>
                      <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Today'}</span>
                    </div>
                  </div>
                ))}
                {!reviews.length && (
                  <p className="text-xs text-stone-400">No reviews recorded yet for this outlet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: VISUAL ANALYTICS CHARTS */}
        {activeTab === 'charts' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <PreparedSoldChart data={preparedVsSoldData} />
            <WasteTrendChart data={wasteTrendData} />
            <PaymentsPie data={paymentData} />
            <div className="flex flex-col justify-center rounded-3xl border border-stone-800 bg-stone-900/90 p-6 shadow-xl space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Revenue & Payment Split Summary
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-800 text-stone-300">
                  <span>Prepaid via Razorpay:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatINR(paymentData.razorpayAmount)} ({paymentData.razorpayCount} orders)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-800 text-stone-300">
                  <span>Cash on Pickup (COD):</span>
                  <span className="font-mono font-bold text-amber-400">
                    {formatINR(paymentData.codAmount)} ({paymentData.codCount} orders)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 text-sm font-black text-white pt-2">
                  <span>Total Cumulative Revenue:</span>
                  <span className="font-mono text-emerald-400">
                    {formatINR(paymentData.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
