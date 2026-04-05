import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

type GuideCardProps = {
  step: string
  title: string
  description: string
  icon: LucideIcon
}

function GuideCard({ step, title, description, icon: Icon }: GuideCardProps) {
  return (
    <article className="panel guide-card">
      <div className="guide-card__icon">
        <Icon size={18} />
      </div>
      <div className="guide-card__body">
        <span className="guide-card__step">{step}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowRight className="guide-card__arrow" size={18} />
    </article>
  )
}

export default GuideCard
