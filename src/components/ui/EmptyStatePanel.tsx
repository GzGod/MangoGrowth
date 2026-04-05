import type { LucideIcon } from 'lucide-react'

type EmptyStatePanelProps = {
  title: string
  description: string
  actionLabel: string
  icon: LucideIcon
  testId?: string
}

function EmptyStatePanel({
  title,
  description,
  actionLabel,
  icon: Icon,
  testId,
}: EmptyStatePanelProps) {
  return (
    <section className="panel empty-state" data-testid={testId}>
      <div className="empty-state__icon">
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button" className="primary-button">
        {actionLabel}
      </button>
    </section>
  )
}

export default EmptyStatePanel
