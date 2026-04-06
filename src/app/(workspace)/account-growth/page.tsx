'use client'

import { BadgeCheck, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { useApiQuery } from '@/hooks/use-api-query'
import { EmptyState, Panel, PrimaryButton } from '@/components/ui/surface'

type DashboardResponse = {
  subscriptions: Array<{
    id: string
    status: string
    endAt: string
    plan: { name: string }
  }>
}

const valueCards = [
  {
    title: '真实账号',
    description: '所有互动均来自经过验证的真实推特账号，拥有真实的活动历史',
    icon: BadgeCheck,
  },
  {
    title: '自动互动',
    description: '每条新推自动获得指定范围内的保证关注数和点赞数',
    icon: Sparkles,
  },
  {
    title: '矩阵增长',
    description: '多个账号协同工作，打造有机的病毒式增长效果',
    icon: Shield,
  },
]

export default function AccountGrowthPage() {
  const { data } = useApiQuery<DashboardResponse>('/api/dashboard')

  return (
    <div className="page-stack page-stack--account-growth">
      <section className="hero-copy account-growth-hero">
        <h2>账号增长计划</h2>
        <p>绑定多个推特账号，每条新推自动获得真实关注与点赞，通过账号矩阵加速增长</p>
      </section>

      <div className="grid-three account-growth-grid">
        {valueCards.map(({ title, description, icon: Icon }) => (
          <Panel key={title} className="info-card info-card--account-growth">
            <div className="info-card__icon">
              <Icon size={20} />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </Panel>
        ))}
      </div>

      {data?.subscriptions && data.subscriptions.length > 0 ? (
        <Panel className="quota-card quota-card--account-growth">
          <div className="panel-heading">
            <div>
              <h3>当前订阅方案</h3>
              <p>已开通的增长计划会在这里展示，并同步订阅状态与到期时间。</p>
            </div>
          </div>
          <div className="quota-list">
            {data.subscriptions.map((subscription) => (
              <div key={subscription.id} className="quota-row">
                <strong>{subscription.plan.name}</strong>
                <span>到期：{new Date(subscription.endAt).toLocaleDateString('zh-CN')}</span>
              </div>
            ))}
          </div>
        </Panel>
      ) : (
        <EmptyState
          title="您还没有订阅方案"
          description="订阅后即可绑定推特账号，每条新推自动获得真实关注与点赞"
          className="empty-state--account-growth"
          action={
            <Link href="/plans">
              <PrimaryButton>立即订阅</PrimaryButton>
            </Link>
          }
        />
      )}
    </div>
  )
}
