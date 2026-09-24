import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#1a5c3a', '#e07a2f', '#f4c95d', '#78716c']

export function PreparedSoldChart({ data }) {
  return (
    <div className="h-64 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <p className="mb-2 font-semibold">Prepared vs Sold vs Unsold</p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="prepared" fill="#1a5c3a" />
          <Bar dataKey="sold" fill="#e07a2f" />
          <Bar dataKey="unsold" fill="#f4c95d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function WasteByItemChart({ data }) {
  return (
    <div className="h-64 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <p className="mb-2 font-semibold">Waste % by item</p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="wastePercent" fill="#e07a2f" name="Waste %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function WasteTrendChart({ data }) {
  return (
    <div className="h-64 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <p className="mb-2 font-semibold">Waste trend (7 days)</p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis unit="%" />
          <Tooltip />
          <Line type="monotone" dataKey="wastePercent" stroke="#1a5c3a" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function NoShowTrendChart({ data }) {
  return (
    <div className="h-64 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <p className="mb-2 font-semibold">No-show trend</p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="noShows" stroke="#e07a2f" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PaymentsPie({ data }) {
  const pie = [
    { name: 'COD', value: data.codCount || 0 },
    { name: 'UPI', value: data.upiCount || 0 },
  ]
  return (
    <div className="h-64 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <p className="mb-2 font-semibold">Payments split</p>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={pie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} label>
            {pie.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
