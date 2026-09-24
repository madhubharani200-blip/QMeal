import { useEffect, useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import AppShell from '../components/AppShell'
import AdminTable from '../components/AdminTable'
import {
  PreparedSoldChart,
  WasteByItemChart,
  WasteTrendChart,
  NoShowTrendChart,
  PaymentsPie,
} from '../components/Charts'
import { useMenu } from '../hooks/useMenu'
import { useOrders } from '../hooks/useOrders'
import { upsertMenuItem, deleteMenuItem, toggleMenuAvailability } from '../services/menuService'
import { listSlots, updateSlotCapacity, ensureSlots } from '../services/slotService'
import {
  buildForecastTable,
  listDailyStats,
  upsertDailyStat,
  paymentAnalytics,
  listUsers,
} from '../services/forecastService'
import { formatINR, todayKey, CATEGORIES } from '../utils/constants'
import { mealsSavedFromStats, mealsSavedFromOrders } from '../utils/wasteCalc'
import { Leaf } from 'lucide-react'

export default function ManagerDashboard() {
  const { menu } = useMenu()
  const { orders } = useOrders()
  const [tab, setTab] = useState('impact')
  const [forecast, setForecast] = useState([])
  const [stats, setStats] = useState([])
  const [slots, setSlots] = useState([])
  const [payments, setPayments] = useState({
    codCount: 0,
    upiCount: 0,
    collected: 0,
    pending: 0,
  })
  const [users, setUsers] = useState([])
  const [menuForm, setMenuForm] = useState({
    name: '',
    price: 50,
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    isAvailable: true,
  })
  const [statForm, setStatForm] = useState({ itemId: '', prepared: 0, sold: 0 })

  const refresh = async () => {
    const [f, s, sl, pay, u] = await Promise.all([
      buildForecastTable(),
      listDailyStats(),
      listSlots(),
      paymentAnalytics(orders),
      listUsers(),
    ])
    setForecast(f)
    setStats(s)
    setSlots(sl)
    setPayments(pay)
    setUsers(u)
    if (!statForm.itemId && menu[0]) setStatForm((p) => ({ ...p, itemId: menu[0].id }))
  }

  useEffect(() => {
    ensureSlots().then(refresh)
  }, [])

  useEffect(() => {
    paymentAnalytics(orders).then(setPayments)
  }, [orders])

  const today = todayKey()
  const todayStats = stats.filter((s) => s.date === today)
  const weekStats = stats.filter((s) => s.date >= format(subDays(new Date(), 6), 'yyyy-MM-dd'))
  const mealsSaved =
    mealsSavedFromStats(weekStats) || mealsSavedFromOrders(orders.filter((o) => o.date >= format(subDays(new Date(), 6), 'yyyy-MM-dd')))

  const preparedSoldData = todayStats.map((s) => ({
    name: (s.itemName || s.itemId || '').slice(0, 10),
    prepared: s.prepared,
    sold: s.sold,
    unsold: s.unsold,
  }))

  const wasteItemData = todayStats.map((s) => ({
    name: (s.itemName || '').slice(0, 10),
    wastePercent: s.wastePercent,
  }))

  const wasteTrend = useMemo(() => {
    const days = {}
    weekStats.forEach((s) => {
      if (!days[s.date]) days[s.date] = { sum: 0, n: 0 }
      days[s.date].sum += s.wastePercent || 0
      days[s.date].n += 1
    })
    return Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date: date.slice(5),
        wastePercent: Math.round((v.sum / v.n) * 10) / 10,
      }))
  }, [weekStats])

  const noShowTrend = useMemo(() => {
    const days = {}
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      days[d] = 0
    }
    orders.forEach((o) => {
      if (o.status === 'no_show' && days[o.date] !== undefined) days[o.date] += 1
    })
    return Object.entries(days).map(([date, noShows]) => ({ date: date.slice(5), noShows }))
  }, [orders])

  const mostOrdered = useMemo(() => {
    const map = {}
    orders.forEach((o) => {
      if (o.status === 'cancelled') return
      o.items.forEach((it) => {
        map[it.name] = (map[it.name] || 0) + it.qty
      })
    })
    return Object.entries(map)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [orders])

  const tabs = [
    { id: 'impact', label: 'Impact' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'menu', label: 'Menu' },
    { id: 'slots', label: 'Slots' },
    { id: 'waste', label: 'Waste entry' },
    { id: 'noshow', label: 'No-show risk' },
  ]

  return (
    <AppShell title="Manager dashboard">
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tab === t.id ? 'bg-brand text-white' : 'bg-white text-muted ring-1 ring-stone-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'impact' && (
        <div className="space-y-4">
          <div className="animate-fade-up relative overflow-hidden rounded-3xl bg-brand px-6 py-8 text-white">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gold/20" />
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-white/15 p-3">
                <Leaf size={28} className="text-gold" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-wider text-white/70">Meals saved this week</p>
                <p className="font-display text-5xl font-bold">{mealsSaved}</p>
                <p className="mt-2 max-w-xl text-sm text-white/80">
                  Meals that didn&apos;t go to waste because of accurate forecasting and on-time pickup — not just
                  measured waste, prevented waste.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PreparedSoldChart data={preparedSoldData} />
            <WasteByItemChart data={wasteItemData} />
            <WasteTrendChart data={wasteTrend} />
            <NoShowTrendChart data={noShowTrend} />
            <PaymentsPie data={payments} />
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
              <p className="mb-2 font-semibold">Payments panel</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-brand-light p-3">
                  <p className="text-muted">COD orders</p>
                  <p className="text-2xl font-bold text-brand">{payments.codCount}</p>
                </div>
                <div className="rounded-xl bg-accent-soft p-3">
                  <p className="text-muted">UPI orders</p>
                  <p className="text-2xl font-bold text-accent">{payments.upiCount}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-muted">Collected</p>
                  <p className="text-xl font-bold">{formatINR(payments.collected)}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-muted">Pending (mostly COD)</p>
                  <p className="text-xl font-bold">{formatINR(payments.pending)}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted">
                UPI is simulated for the hackathon. Production path: Razorpay test mode.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display mb-2 text-lg font-semibold">Most ordered items</h3>
            <AdminTable
              columns={[
                { key: 'name', label: 'Item' },
                { key: 'qty', label: 'Qty' },
              ]}
              rows={mostOrdered}
            />
          </div>
        </div>
      )}

      {tab === 'forecast' && (
        <div className="space-y-3">
          <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
            <strong>Rule-based statistical estimate (not AI/ML):</strong> predicted = 0.5×same-weekday-7d +
            0.3×last-3d-avg + 0.2×current preorders; adjusted for avg no-show rate; prep = ceil(adjusted × 1.05).
            Fallback: current × 1.2.
          </p>
          <button type="button" onClick={refresh} className="rounded-lg bg-stone-100 px-3 py-1.5 text-sm font-semibold">
            Refresh forecast
          </button>
          <AdminTable
            columns={[
              { key: 'name', label: 'Food item' },
              { key: 'currentPreorders', label: 'Current preorders' },
              { key: 'predictedDemand', label: 'Predicted demand' },
              { key: 'recommendedPreparation', label: 'Recommended prep' },
              {
                key: 'avgNoShowRate',
                label: 'No-show adj.',
                render: (r) => `${Math.round(r.avgNoShowRate * 100)}%`,
              },
            ]}
            rows={forecast}
            empty="No forecastable menu items"
          />
        </div>
      )}

      {tab === 'menu' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100"
            onSubmit={async (e) => {
              e.preventDefault()
              await upsertMenuItem({ ...menuForm, price: Number(menuForm.price) })
              setMenuForm({ ...menuForm, name: '' })
              refresh()
            }}
          >
            <h3 className="font-display text-lg font-semibold">Add / update menu item</h3>
            <input
              required
              placeholder="Name"
              value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2"
            />
            <input
              type="number"
              required
              value={menuForm.price}
              onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2"
            />
            <select
              value={menuForm.category}
              onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="Image URL"
              value={menuForm.imageUrl}
              onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2"
            />
            <button type="submit" className="rounded-xl bg-brand px-4 py-2 font-semibold text-white">
              Save item
            </button>
          </form>
          <AdminTable
            columns={[
              { key: 'name', label: 'Item' },
              { key: 'price', label: 'Price', render: (r) => formatINR(r.price) },
              { key: 'category', label: 'Category' },
              {
                key: 'isAvailable',
                label: 'Avail',
                render: (r) => (
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand underline"
                    onClick={() => toggleMenuAvailability(r.id, !r.isAvailable).then(refresh)}
                  >
                    {r.isAvailable ? 'Yes' : 'No'}
                  </button>
                ),
              },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <button
                    type="button"
                    className="text-xs text-danger"
                    onClick={() => deleteMenuItem(r.id).then(refresh)}
                  >
                    Delete
                  </button>
                ),
              },
            ]}
            rows={menu}
          />
        </div>
      )}

      {tab === 'slots' && (
        <div className="space-y-3">
          <p className="text-sm text-muted">Today&apos;s 15-min slots — adjust capacity as needed.</p>
          <AdminTable
            columns={[
              { key: 'time', label: 'Time' },
              { key: 'bookedCount', label: 'Booked' },
              { key: 'maxCapacity', label: 'Capacity' },
              {
                key: 'edit',
                label: 'Update',
                render: (r) => (
                  <input
                    type="number"
                    defaultValue={r.maxCapacity}
                    min={1}
                    className="w-20 rounded-lg border border-stone-200 px-2 py-1"
                    onBlur={(e) => updateSlotCapacity(r.id, e.target.value).then(() => listSlots().then(setSlots))}
                  />
                ),
              },
            ]}
            rows={slots}
          />
        </div>
      )}

      {tab === 'waste' && (
        <form
          className="max-w-md space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100"
          onSubmit={async (e) => {
            e.preventDefault()
            const item = menu.find((m) => m.id === statForm.itemId)
            await upsertDailyStat({
              date: today,
              itemId: statForm.itemId,
              itemName: item?.name,
              prepared: Number(statForm.prepared),
              sold: Number(statForm.sold),
              preorders:
                todayStats.find((s) => s.itemId === statForm.itemId)?.preorders ||
                Number(statForm.sold),
            })
            refresh()
          }}
        >
          <h3 className="font-display text-lg font-semibold">Enter prepared / sold</h3>
          <p className="text-sm text-muted">Waste % auto-calculates: unsold = prepared − sold.</p>
          <select
            value={statForm.itemId}
            onChange={(e) => setStatForm({ ...statForm, itemId: e.target.value })}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
          >
            {menu.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Prepared"
            value={statForm.prepared}
            onChange={(e) => setStatForm({ ...statForm, prepared: e.target.value })}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
          />
          <input
            type="number"
            placeholder="Sold"
            value={statForm.sold}
            onChange={(e) => setStatForm({ ...statForm, sold: e.target.value })}
            className="w-full rounded-xl border border-stone-200 px-3 py-2"
          />
          <button type="submit" className="rounded-xl bg-brand px-4 py-2 font-semibold text-white">
            Save & calculate waste
          </button>
        </form>
      )}

      {tab === 'noshow' && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Student no-show rates feed the forecast adjustment so we don&apos;t over-prepare for high-risk pending
            orders.
          </p>
          <AdminTable
            columns={[
              { key: 'name', label: 'Student' },
              { key: 'totalOrders', label: 'Orders' },
              { key: 'noShowCount', label: 'No-shows' },
              {
                key: 'rate',
                label: 'Rate',
                render: (r) =>
                  r.totalOrders
                    ? `${Math.round(((r.noShowCount || 0) / r.totalOrders) * 100)}%`
                    : '—',
              },
            ]}
            rows={users.filter((u) => u.role === 'student')}
          />
        </div>
      )}
    </AppShell>
  )
}
