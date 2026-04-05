import type { LucideIcon } from 'lucide-react'

type InfoCardProps = {
  title: string
  description: string
  icon: LucideIcon
}

function InfoCard({ title, description, icon: Icon }: InfoCardProps) {
  return (
    <article className="panel info-card">
      <div className="info-card__icon">
        <Icon size={20} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  )
}

export default InfoCard
