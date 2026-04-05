import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  label: string
  value: string
  icon?: LucideIcon
}

function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <article className="panel metric-card">
      <div className="metric-card__header">
        <span>{label}</span>
        {Icon ? (
          <span className="metric-card__icon">
            <Icon size={16} />
          </span>
        ) : null}
      </div>
      <strong className="metric-card__value">{value}</strong>
    </article>
  )
}

export default MetricCard
