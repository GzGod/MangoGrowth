'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type UsageChartProps = {
  data: Array<{ date: string; credits: number }>
}

export function UsageChart({ data }: UsageChartProps) {
  return (
    <div className="chart-card__canvas">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={24}>
          <CartesianGrid vertical={false} stroke="#efe6d8" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8f8579', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8f8579', fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'rgba(255, 149, 0, 0.08)' }} />
          <Bar dataKey="credits" fill="#FF9500" radius={[10, 10, 0, 0]} maxBarSize={96} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
