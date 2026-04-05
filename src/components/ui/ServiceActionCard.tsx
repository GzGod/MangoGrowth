import type { LucideIcon } from 'lucide-react'

type ServiceActionCardProps = {
  title: string
  description: string
  icon: LucideIcon
}

function ServiceActionCard({ title, description, icon: Icon }: ServiceActionCardProps) {
  return (
    <article className="panel service-card" data-testid="service-action-card">
      <div className="service-card__icon">
        <Icon size={22} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  )
}

export default ServiceActionCard
