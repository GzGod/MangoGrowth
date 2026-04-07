'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type UsageChartProps = {
  data: Array<{ date: string; usd: number }>
}

export function UsageChart({ data }: UsageChartProps) {
  return (
    <div className="chart-card__canvas">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={24}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#767676', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#767676', fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'rgba(29, 78, 216, 0.06)' }} />
          <Bar dataKey="usd" fill="#3478f6" radius={[10, 10, 0, 0]} maxBarSize={96} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
