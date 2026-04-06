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
    description: '所有互动和订单都进入统一流转模型，便于后续管理和审计。',
    icon: BadgeCheck,
  },
  {
    title: '自动互动',
    description: '服务、订阅与任务建立清晰状态链路，后台可持续跟踪。',
    icon: Sparkles,
  },
  {
    title: '矩阵增长',
    description: '管理员可以从一个后台查看谁下单、购买了什么以及当前进度。',
    icon: Shield,
  },
] as const

export default function AccountGrowthPage() {
  const { data } = useApiQuery<DashboardResponse>('/api/dashboard')

  return (
    <div className="page-stack page-stack--growth">
      <section className="hero-copy">
        <h2>账户增长计划</h2>
        <p>绑定多个增长模式，把用户充值、下单、任务和订阅都放在同一套控制台里。</p>
      </section>

      <div className="growth-plan-grid">
        {valueCards.map(({ title, description, icon: Icon }) => (
          <Panel key={title} className="info-card growth-plan-card">
            <div className="info-card__icon growth-plan-card__icon">
              <Icon size={48} />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </Panel>
        ))}
      </div>

      {data?.subscriptions && data.subscriptions.length > 0 ? (
        <Panel className="quota-card growth-subscription-card">
          <div className="panel-heading">
            <div>
              <h3>已激活订阅</h3>
              <p>当前账户已开通的订阅方案。</p>
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
          description="订阅后即可开始长期自动化增长，系统也会同步生成完整的账单与订单记录。"
          action={
            <Link href="/plans">
              <PrimaryButton className="growth-empty-state__button">立即订阅</PrimaryButton>
            </Link>
          }
          className="growth-empty-state"
        />
      )}
    </div>
  )
}
