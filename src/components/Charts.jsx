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

const COLORS = ['#10b981', '#f59e0b', '#06b6d4', '#64748b']

const customTooltipStyle = {
  backgroundColor: '#1c1917',
  border: '1px solid #44403c',
  borderRadius: '12px',
  color: '#f5f5f4',
  fontSize: '12px',
}

export function PreparedSoldChart({ data = [] }) {
  return (
    <div className="h-72 rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl backdrop-blur">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-300">
        Prepared vs Sold vs Unsold
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#78716c" tick={{ fontSize: 10, fill: '#a8a29e' }} />
          <YAxis stroke="#78716c" tick={{ fontSize: 10, fill: '#a8a29e' }} allowDecimals={false} />
          <Tooltip contentStyle={customTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#d6d3d1' }} />
          <Bar dataKey="prepared" fill="#10b981" radius={[4, 4, 0, 0]} name="Prepared" />
          <Bar dataKey="sold" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Sold / Preordered" />
          <Bar dataKey="unsold" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Unsold Waste" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function WasteTrendChart({ data = [] }) {
  return (
    <div className="h-72 rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl backdrop-blur">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-300">
        Food Waste Reduction Trend (7-Day %)
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#78716c" tick={{ fontSize: 10, fill: '#a8a29e' }} />
          <YAxis stroke="#78716c" tick={{ fontSize: 10, fill: '#a8a29e' }} unit="%" />
          <Tooltip contentStyle={customTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#d6d3d1' }} />
          <Line
            type="monotone"
            dataKey="wastePercent"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            name="Waste %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PaymentsPie({ data = {} }) {
  const pie = [
    { name: 'Razorpay (Prepaid)', value: data.razorpayCount || 0 },
    { name: 'Cash on Pickup (COD)', value: data.codCount || 0 },
  ]

  return (
    <div className="h-72 rounded-3xl border border-stone-800 bg-stone-900/90 p-5 shadow-xl backdrop-blur">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-300">
        Payment Gateway Split
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={pie}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={4}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {pie.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={customTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#d6d3d1' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
