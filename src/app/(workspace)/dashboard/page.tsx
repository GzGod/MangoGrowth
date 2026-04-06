'use client'

import { ArrowRight, CircleDollarSign, FolderKanban, PlusCircle, Rocket, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { UsageChart } from '@/components/charts/usage-chart'
import { EmptyState, Panel, PrimaryButton, SectionTitle, StatCard, StatusPill, TableShell } from '@/components/ui/surface'
import { useApiQuery } from '@/hooks/use-api-query'
import { usageRanges } from '@/lib/data/dashboard'

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
    description: '充值资产获取平台积分，开启您的增长之旅',
    icon: PlusCircle,
  },
  {
    step: 'STEP 2',
    title: '启动增长',
    description: '消耗积分，增长粉丝、互动量，提高账号影响力',
    icon: Rocket,
  },
] as const

export default function DashboardPage() {
  const { data, loading } = useApiQuery<DashboardResponse>('/api/dashboard')
  const [activeRange, setActiveRange] = useState<UsageRangeKey>('last7')

  const chartData = useMemo(() => data?.usage?.[activeRange] ?? [], [activeRange, data])

  return (
    <div className="page-stack page-stack--dashboard">
      <section>
        <SectionTitle>新手引导</SectionTitle>
        <div className="grid-two dashboard-guide-grid">
          {onboarding.map((card) => {
            const Icon = card.icon

            return (
              <Panel key={card.title} className="guide-card guide-card--dashboard">
                <div className="guide-card__icon">
                  <Icon size={18} />
                </div>
                <div className="guide-card__body">
                  <span className="guide-card__step">{card.step}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <ArrowRight size={16} className="guide-card__arrow" />
              </Panel>
            )
          })}
        </div>
      </section>

      <section>
        <SectionTitle>概览</SectionTitle>
        <div className="grid-three dashboard-metrics-grid">
          <StatCard label="我的积分" value={loading ? '...' : data?.metrics.balance.toLocaleString() ?? '0'} icon={CircleDollarSign} />
          <StatCard label="订单总数" value={loading ? '...' : data?.metrics.orderCount ?? 0} icon={FolderKanban} />
          <StatCard label="花费积分总数" value={loading ? '...' : data?.metrics.spentCredits.toLocaleString() ?? '0'} icon={WalletCards} />
        </div>
      </section>

      <section>
        <SectionTitle>套餐配额</SectionTitle>
        {data?.subscriptions && data.subscriptions.length > 0 ? (
          <Panel className="quota-card quota-card--dashboard">
            <div className="panel-heading">
              <div>
                <h3>当前激活套餐</h3>
                <p>这里展示你当前可用的长期订阅方案和到期时间。</p>
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
            description="先购买套餐后再回到这里查看配额、执行进度与消耗情况。"
            className="empty-state--dashboard"
            action={
              <Link href="/plans">
                <PrimaryButton>购买套餐</PrimaryButton>
              </Link>
            }
          />
        )}
      </section>

      <Panel className="chart-card chart-card--dashboard">
        <div className="chart-card__header">
          <div>
            <h3>使用量</h3>
            <p>(1,000 Credits)</p>
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

      <Panel className="dashboard-orders-panel">
        <div className="panel-heading panel-heading--dashboard">
          <div>
            <h3>最近订单</h3>
            <p>您最近的增长任务订单（20 条记录）</p>
          </div>
          <Link href="/orders" className="inline-link">
            查看全部
          </Link>
        </div>
        <TableShell
          columns={['订单 ID', '订单状态', '订单名称', '创建时间', '进度', '使用量 (Credits)', '预计剩余时间']}
          rows={(data?.orders ?? []).slice(0, 5).map((order) => [
            order.id,
            <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
            order.plan.name,
            new Date(order.createdAt).toLocaleString('zh-CN'),
            `${order.progress}% (${order.progress}/100)`,
            order.creditsCost.toLocaleString(),
            '0',
          ])}
          emptyText="还没有订单，先去套餐页购买一个方案。"
        />
      </Panel>
    </div>
  )
}
