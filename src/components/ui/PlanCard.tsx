import type { LucideIcon } from 'lucide-react'

type FeatureItem = {
  icon: LucideIcon
  label: string
  value: string
}

type PlanCardProps = {
  name: string
  price: string
  unit?: string
  originalPrice?: string
  description: string
  actionLabel: string
  features?: FeatureItem[]
  ranges?: FeatureItem[]
  featured?: boolean
  badge?: string
  onAction?: () => void
  actionTestId?: string
}

function PlanCard({
  name,
  price,
  unit,
  originalPrice,
  description,
  actionLabel,
  features,
  ranges,
  featured = false,
  badge,
  onAction,
  actionTestId,
}: PlanCardProps) {
  const items = features ?? ranges ?? []

  return (
    <article className={`panel plan-card${featured ? ' is-featured' : ''}`}>
      {badge ? <span className="plan-card__badge">{badge}</span> : null}
      <div className="plan-card__head">
        <h3>{name}</h3>
        <div className="plan-card__price-row">
          <strong>{price}</strong>
          {unit ? <span>{unit}</span> : null}
          {originalPrice ? <s>{originalPrice}</s> : null}
        </div>
        <p>{description}</p>
      </div>

      {items.length > 0 ? (
        <ul className="plan-card__list">
          {items.map(({ icon: Icon, label, value }) => (
            <li key={`${label}-${value}`}>
              <span className="plan-card__item-label">
                <Icon size={15} />
                {label}
              </span>
              <strong>{value}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <div className="plan-card__custom">适合规模化运营团队，为您量身定制价格方案。</div>
      )}

      <button
        type="button"
        className={`plan-card__button${featured ? ' is-dark' : ''}`}
        onClick={onAction}
        data-testid={actionTestId}
      >
        {actionLabel}
      </button>
    </article>
  )
}

export default PlanCard
