'use client'

import { ArrowRight, CircleDollarSign, FolderKanban, WalletCards } from 'lucide-react'
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
    step: '01',
    badge: 'STEP 1',
    progress: '完成度 50%',
    title: '充值获取平台积分',
    description: '先准备好积分余额，后续套餐、任务和订阅都能顺畅进入同一套流程里。',
    tone: 'warm' as const,
  },
  {
    step: '02',
    badge: 'STEP 2',
    progress: '完成度 100%',
    title: '启动增长任务',
    description: '购买套餐后，系统会把订单、执行进度和消耗情况统一沉淀到控制台里。',
    tone: 'bright' as const,
  },
] as const

export default function DashboardPage() {
  const { data, loading } = useApiQuery<DashboardResponse>('/api/dashboard')
  const [activeRange, setActiveRange] = useState<UsageRangeKey>('last7')

  const chartData = useMemo(() => data?.usage?.[activeRange] ?? [], [activeRange, data])
  const hasOrders = (data?.orders?.length ?? 0) > 0
  const hasSubscriptions = (data?.subscriptions?.length ?? 0) > 0

  return (
    <div className="page-stack page-stack--dashboard">
      <section className="dashboard-section">
        <div className="dashboard-section__title-row">
          <SectionTitle>新手引导</SectionTitle>
          <span className="dashboard-section__meta">2 步完成</span>
        </div>
        <div className="grid-two dashboard-guide-grid">
          {onboarding.map((card) => (
            <Panel key={card.title} className={`guide-card guide-card--dashboard guide-card--${card.tone}`}>
              <div className="guide-card__visual" aria-hidden="true">
                <div className="guide-card__orb" />
                <div className="guide-card__planet" />
                <div className="guide-card__step-index">{card.step}</div>
              </div>
              <div className="guide-card__body">
                <div className="guide-card__topline">
                  <span className="guide-card__step">{card.badge}</span>
                  <span className="guide-card__progress">{card.progress}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <button type="button" className="guide-card__button" aria-label={card.title}>
                <ArrowRight size={16} className="guide-card__arrow" />
              </button>
            </Panel>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__title-row">
          <SectionTitle>概览</SectionTitle>
          <span className="dashboard-section__meta">实时账户状态</span>
        </div>
        <div className="grid-three dashboard-metrics-grid">
          <StatCard label="我的积分" value={loading ? '...' : data?.metrics.balance.toLocaleString() ?? '0'} icon={CircleDollarSign} />
          <StatCard label="订单总数" value={loading ? '...' : data?.metrics.orderCount ?? 0} icon={FolderKanban} />
          <StatCard label="花费积分总数" value={loading ? '...' : data?.metrics.spentCredits.toLocaleString() ?? '0'} icon={WalletCards} />
        </div>
      </section>

      <div className="grid-two dashboard-insights-grid">
        <Panel className="dashboard-quota-card">
          <div className="panel-heading dashboard-panel-heading">
            <div>
              <SectionTitle>套餐配额</SectionTitle>
              <p>展示当前订阅状态、配额容量和近期启用情况。</p>
            </div>
            <span className="dashboard-panel-badge">配额视图</span>
          </div>

          <div className="dashboard-quota-card__body">
            <div className="dashboard-quota-card__copy">
              {hasSubscriptions ? (
                <div className="quota-list">
                  {data?.subscriptions.map((subscription) => (
                    <div key={subscription.id} className="quota-row">
                      <strong>{subscription.plan.name}</strong>
                      <span>到期：{new Date(subscription.endAt).toLocaleDateString('zh-CN')}</span>
                      <StatusPill>{subscription.status}</StatusPill>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty-copy">
                  <h3>当前还没有激活的套餐</h3>
                  <p>购买套餐后，你会在这里看到配额变化、启用状态和后续执行入口。</p>
                  <Link href="/plans">
                    <PrimaryButton>立即购买套餐</PrimaryButton>
                  </Link>
                </div>
              )}
            </div>

            <div className="dashboard-placeholder dashboard-placeholder--quota" aria-hidden="true">
              <div className="dashboard-placeholder__ring">
                <div className="dashboard-placeholder__ring-core" />
              </div>
              <div className="dashboard-placeholder__bars">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="chart-card dashboard-usage-card">
          <div className="chart-card__header dashboard-panel-heading">
            <div>
              <SectionTitle>使用量</SectionTitle>
              <p>基于真实积分消费流水，并叠加轻量占位趋势图形。</p>
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

          <div className="dashboard-usage-card__chart-shell">
            <div className="dashboard-placeholder dashboard-placeholder--usage" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <UsageChart data={chartData} />
          </div>
        </Panel>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section__title-row">
          <SectionTitle>最近订单</SectionTitle>
          <Link href="/orders" className="inline-link">
            查看全部
          </Link>
        </div>

        {hasOrders ? (
          <Panel>
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
            />
          </Panel>
        ) : (
          <EmptyState
            eyebrow="订单中心"
            title="还没有任何订单哦～"
            description="先挑一个适合你的套餐，系统会自动生成订单并同步到账单与管理员后台。"
            action={
              <Link href="/plans">
                <PrimaryButton>立即购买套餐</PrimaryButton>
              </Link>
            }
          />
        )}
      </section>
    </div>
  )
}
