import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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
            tick={{ fontSize: 9, fill: '#888880' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#888880' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #d0c8bc',
              borderRadius: 0,
              fontSize: 11,
              fontFamily: 'Barlow, system-ui',
            }}
            labelStyle={{ color: '#888880' }}
            itemStyle={{ color: '#e05535', fontWeight: 700 }}
            formatter={(v, n, p) => [`${v} pts`, p.payload.circuit]}
          />
          <Line
            type="monotone"
            dataKey="pts"
            stroke="#1a1a1a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#e05535', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
