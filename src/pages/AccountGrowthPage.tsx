import EmptyStatePanel from '../components/ui/EmptyStatePanel'
import InfoCard from '../components/ui/InfoCard'
import { growthHighlights, subscriptionEmptyState } from '../data/account'

function AccountGrowthPage() {
  return (
    <div className="page-stack">
      <section className="hero-copy">
        <h2>账号增长计划</h2>
        <p>绑定多个推特账号，每条新推自动获得真实关注与点赞，通过账号矩阵加速增长。</p>
      </section>

      <section className="grid-three">
        {growthHighlights.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </section>

      <EmptyStatePanel {...subscriptionEmptyState} testId="subscription-empty-state" />
    </div>
  )
}

export default AccountGrowthPage
