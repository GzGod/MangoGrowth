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
    description: '所有互动水位都先进入订单与任务模型，方便后端做可审计的流转管理。',
    icon: BadgeCheck,
  },
  {
    title: '自动互动',
    description: '每次新增服务、订阅和订单都会带着完整的业务状态进入后台视图。',
    icon: Sparkles,
  },
  {
    title: '矩阵增长',
    description: '管理员可以从一个后台查看谁下单了、买了什么、当前进度和积分变化。',
    icon: Shield,
  },
]

export default function AccountGrowthPage() {
  const { data } = useApiQuery<DashboardResponse>('/api/dashboard')

  return (
    <div className="page-stack">
      <section className="hero-copy">
        <h2>账号增长计划</h2>
        <p>绑定多个增长模式，把用户充值、下单、任务和订阅都放在同一套控制台里。</p>
      </section>

      <div className="grid-three">
        {valueCards.map(({ title, description, icon: Icon }) => (
          <Panel key={title} className="info-card">
            <div className="info-card__icon">
              <Icon size={18} />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </Panel>
        ))}
      </div>

      {data?.subscriptions && data.subscriptions.length > 0 ? (
        <Panel className="quota-card">
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
          description="订阅后即可开启长期自动化增长，管理员后台也会同步出现完整订单信息。"
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
