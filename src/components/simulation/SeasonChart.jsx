import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function SeasonChart({ races }) {
  const data = races.map((r, i) => ({
    name: r.emoji || `R${i + 1}`,
    pts: r.playerPoints,
    circuit: r.circuit,
  }))

  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: '#555577' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#555577' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#1a1a28', border: '1px solid #2a2a3a', borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: '#8888aa' }}
            itemStyle={{ color: '#e10600' }}
            formatter={(v, n, p) => [`${v} pts`, p.payload.circuit]}
          />
          <Line
            type="monotone"
            dataKey="pts"
            stroke="#e10600"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#e10600' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
