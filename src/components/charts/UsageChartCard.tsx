import { useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type RangeOption = {
  id: string
  label: string
}

type UsagePoint = {
  label: string
  value: number
}

type UsageChartCardProps = {
  title: string
  subtitle: string
  ranges: RangeOption[]
  datasets: Record<string, readonly UsagePoint[]>
  testId?: string
}

function UsageChartCard({ title, subtitle, ranges, datasets, testId }: UsageChartCardProps) {
  const [activeRange, setActiveRange] = useState(ranges[0]?.id ?? '')
  const data = [...(datasets[activeRange] ?? [])]

  return (
    <section className="panel chart-card" data-testid={testId}>
      <div className="chart-card__header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="chart-card__ranges">
          {ranges.map((range) => (
            <button
              key={range.id}
              type="button"
              className={activeRange === range.id ? 'is-active' : ''}
              onClick={() => setActiveRange(range.id)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-card__canvas">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} width={32} />
            <Tooltip cursor={{ fill: 'rgba(24, 119, 242, 0.08)' }} />
            <Bar dataKey="value" fill="#3478f6" radius={[10, 10, 0, 0]} barSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default UsageChartCard
