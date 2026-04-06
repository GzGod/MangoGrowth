'use client'

import { ArrowRight, CircleDollarSign, FolderKanban, Rocket, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { UsageChart } from '@/components/charts/usage-chart'
import { useApiQuery } from '@/hooks/use-api-query'
import { usageRanges } from '@/lib/data/dashboard'
import { EmptyState, Panel, PrimaryButton, SectionTitle, StatCard, StatusPill, TableShell } from '@/components/ui/surface'

type UsageRangeKey = (typeof usageRanges)[number]['key']

type DashboardResponse = {
  metrics: {
    balance: number
    orderCount: number
    spentCredits: number
  }
  usage: Record<UsageRangeKey, Array<{ date: string; credits: number }>>
  orders: Array<{
    id: string
    status: string
    creditsCost: number
    progress: number
    createdAt: string
    plan: { name: string }
  }>
  subscriptions: Array<{
    id: string
    status: string
    endAt: string
    plan: { name: string }
  }>
}

const onboarding = [
  {
    step: 'STEP 1',
    title: '充值获取平台积分',
    description: '先完成充值，把积分余额准备好，后续套餐与服务都能直接消耗积分。',
  },
  {
    step: 'STEP 2',
    title: '启动增长任务',
    description: '购买套餐或订阅后，创建任务并跟踪执行进度与订单状态。',
  },
] as const

export default function DashboardPage() {
  const { data, loading } = useApiQuery<DashboardResponse>('/api/dashboard')
  const [activeRange, setActiveRange] = useState<UsageRangeKey>('last7')

  const chartData = useMemo(() => data?.usage?.[activeRange] ?? [], [activeRange, data])

  return (
    <div className="page-stack">
      <section>
        <SectionTitle>新手引导</SectionTitle>
        <div className="grid-two">
          {onboarding.map((card) => (
            <Panel key={card.title} className="guide-card">
              <div className="guide-card__icon">
                <Rocket size={18} />
              </div>
              <div className="guide-card__body">
                <span className="guide-card__step">{card.step}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <ArrowRight size={16} className="guide-card__arrow" />
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>概览</SectionTitle>
        <div className="grid-three">
          <StatCard label="我的积分" value={loading ? '...' : data?.metrics.balance.toLocaleString() ?? '0'} icon={CircleDollarSign} />
          <StatCard label="订单总数" value={loading ? '...' : data?.metrics.orderCount ?? 0} icon={FolderKanban} />
          <StatCard label="花费积分总数" value={loading ? '...' : data?.metrics.spentCredits.toLocaleString() ?? '0'} icon={WalletCards} />
        </div>
      </section>

      <section>
        <SectionTitle>套餐配额</SectionTitle>
        {data?.subscriptions && data.subscriptions.length > 0 ? (
          <Panel className="quota-card">
            <div className="panel-heading">
              <div>
                <h3>当前激活订阅</h3>
                <p>你当前可用的长期订阅方案与到期时间。</p>
              </div>
            </div>
            <div className="quota-list">
              {data.subscriptions.map((subscription) => (
                <div key={subscription.id} className="quota-row">
                  <strong>{subscription.plan.name}</strong>
                  <span>到期：{new Date(subscription.endAt).toLocaleDateString('zh-CN')}</span>
                  <StatusPill>{subscription.status}</StatusPill>
                </div>
              ))}
            </div>
          </Panel>
        ) : (
          <EmptyState
            title="您还没有激活的套餐"
            description="先购买套餐或订阅，再回来查看配额、执行进度和消耗情况。"
            action={
              <Link href="/plans">
                <PrimaryButton>购买套餐</PrimaryButton>
              </Link>
            }
          />
        )}
      </section>

      <Panel className="chart-card">
        <div className="chart-card__header">
          <div>
            <h3>使用量</h3>
            <p>基于真实积分消费流水</p>
          </div>
          <div className="chart-card__ranges">
            {usageRanges.map((range) => (
              <button
                key={range.key}
                type="button"
                className={range.key === activeRange ? 'is-active' : ''}
                onClick={() => setActiveRange(range.key)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <UsageChart data={chartData} />
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>最近订单</h3>
            <p>最近的增长任务和订阅购买记录。</p>
          </div>
          <Link href="/orders" className="inline-link">
            查看全部
          </Link>
        </div>
        <TableShell
          columns={['订单 ID', '状态', '订单名称', '创建时间', '进度', '使用量 (Credits)']}
          rows={(data?.orders ?? []).slice(0, 5).map((order) => [
            order.id,
            <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
            order.plan.name,
            new Date(order.createdAt).toLocaleString('zh-CN'),
            `${order.progress}%`,
            order.creditsCost.toLocaleString(),
          ])}
          emptyText="还没有订单，先去套餐页购买一个方案。"
        />
      </Panel>
    </div>
  )
}
