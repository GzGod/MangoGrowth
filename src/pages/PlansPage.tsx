import { useState } from 'react'
import PointsPurchaseModal from '../components/modals/PointsPurchaseModal'
import PlanCard from '../components/ui/PlanCard'
import { creditBundles, servicePlans, subscriptionPlans } from '../data/plans'

function PlansPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)

  return (
    <>
      <div className="page-stack">
        <section className="hero-copy">
          <h2>选择服务套餐</h2>
          <p>选择适合您的增长服务套餐</p>
        </section>

        <section className="plan-grid">
          {servicePlans.map((plan, index) => (
            <PlanCard
              key={plan.name}
              {...plan}
              onAction={() => setIsModalOpen(true)}
              actionTestId={index === 2 ? 'open-credits-modal' : undefined}
            />
          ))}
        </section>

        <section className="hero-copy hero-copy--tight">
          <h2>选择您的订阅</h2>
          <p>选择最适合您需求的订阅，开启增长之旅</p>
        </section>

        <section className="plan-grid">
          {subscriptionPlans.map((plan) => (
            <PlanCard key={plan.name} {...plan} onAction={() => setIsModalOpen(true)} />
          ))}
        </section>

        <section className="panel redeem-card">
          <div>
            <h3>兑换订阅码</h3>
            <p>输入您的兑换码以激活订阅计划</p>
          </div>
          <div className="redeem-card__row">
            <input type="text" placeholder="请输入兑换码" />
            <button type="button" className="secondary-button">
              兑换
            </button>
          </div>
        </section>
      </div>

      <PointsPurchaseModal
        open={isModalOpen}
        bundles={creditBundles}
        selectedBundle={selectedBundle}
        onSelect={setSelectedBundle}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default PlansPage
