'use client'

import { CircleDollarSign, Copy, CreditCard, UserRound, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { UsageChart } from '@/components/charts/usage-chart'
import { useSession } from '@/components/providers/session-provider'
import { EmptyState, Panel, PrimaryButton, StatCard, StatusPill, TableShell } from '@/components/ui/surface'
import { useApiQuery } from '@/hooks/use-api-query'
import { resolveDisplayIdentity } from '@/lib/auth/identity'
import { usageRanges } from '@/lib/data/dashboard'

type UsageRangeKey = (typeof usageRanges)[number]['key']
type PaymentTab = 'recharge' | 'package' | 'subscription'

type DashboardResponse = {
  metrics: {
    balance: number
    orderCount: number
    spentCredits: number
  }
  usage: Record<UsageRangeKey, Array<{ date: string; credits: number }>>
  rechargeOrders: Array<{
    id: string
    credits: number
    amountUsd: number
    status: string
    createdAt: string
  }>
  transactions: Array<{
    id: string
    type: string
    amount: number
    balanceAfter: number
    description: string
    createdAt: string
  }>
}

const paymentTabs: Array<{ key: PaymentTab; label: string }> = [
  { key: 'recharge', label: '充值' },
  { key: 'package', label: '套餐' },
  { key: 'subscription', label: '订阅' },
]

export default function BillingPage() {
  const { user, authIdentity, isAuthenticated } = useSession()
  const { data } = useApiQuery<DashboardResponse>('/api/dashboard')
  const [activeRange, setActiveRange] = useState<UsageRangeKey>('last7')
  const [activePaymentTab, setActivePaymentTab] = useState<PaymentTab>('recharge')

  const chartData = useMemo(() => data?.usage?.[activeRange] ?? [], [activeRange, data])
  const displayIdentity = resolveDisplayIdentity(user, authIdentity, isAuthenticated)
  const paymentRows =
    activePaymentTab === 'recharge'
      ? (data?.rechargeOrders ?? []).map((order) => [
          order.id,
          <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
          order.credits.toLocaleString(),
          '$' + order.amountUsd,
          'USDT',
          new Date(order.createdAt).toLocaleString('zh-CN'),
          '-',
        ])
      : []

  const consumptionRows = (data?.transactions ?? []).map((transaction) => [
    transaction.description,
    new Date(transaction.createdAt).toLocaleString('zh-CN'),
    <span key={`${transaction.id}-amount`} className={transaction.amount > 0 ? 'billing-value billing-value--positive' : 'billing-value billing-value--negative'}>
      {transaction.amount > 0 ? '+' : ''}
      {transaction.amount.toLocaleString()}
    </span>,
  ])

  return (
    <div className="page-stack page-stack--billing">
      <div className="grid-three billing-top-grid">
        <Panel className="profile-card billing-profile-card">
          <span className="profile-card__label">我的资料</span>
          <div className="profile-card__row">
            <div className="billing-profile-card__content">
              <strong title={displayIdentity.title}>{displayIdentity.label}</strong>
              <p>{user?.id ? `UID: ${user.id}` : 'Privy 用户'}</p>
            </div>
            <div className="billing-profile-card__icon-row">
              <div className="metric-card__icon">
                <UserRound size={18} />
              </div>
              <button type="button" className="billing-copy-button" aria-label="复制用户信息">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </Panel>

        <StatCard label="我的积分" value={data?.metrics.balance.toLocaleString() ?? '0'} icon={CircleDollarSign} />
        <StatCard label="花费积分总数" value={data?.metrics.spentCredits.toLocaleString() ?? '0'} icon={WalletCards} />
      </div>

      <section>
        <div className="section-title">套餐配额</div>
        <EmptyState
          title="您还没有激活的套餐"
          description="先购买套餐再回到这里查看配额、执行进度和消耗情况。"
          className="empty-state--billing"
          action={
            <Link href="/plans">
              <PrimaryButton>购买套餐</PrimaryButton>
            </Link>
          }
        />
      </section>

      <Panel className="chart-card chart-card--billing">
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

      <Panel className="billing-section-panel">
        <div className="panel-heading billing-section-heading">
          <div>
            <h3>支付订单</h3>
            <p>显示最近 20 条支付订单</p>
          </div>
          <button type="button" className="billing-refresh-button" aria-label="刷新支付订单">
            <CreditCard size={14} />
          </button>
        </div>

        <div className="billing-tabs">
          {paymentTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`billing-tabs__item${tab.key === activePaymentTab ? ' is-active' : ''}`}
              onClick={() => setActivePaymentTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <TableShell
          columns={['订单 ID', '状态', '积分', '金额', '代币', '创建时间', '操作']}
          rows={paymentRows}
          emptyText="当前分类下还没有支付订单。"
        />
      </Panel>

      <Panel className="billing-section-panel">
        <div className="panel-heading billing-section-heading">
          <div>
            <h3>任务消耗</h3>
            <p>显示增长任务消耗的积分记录（20 条）</p>
          </div>
          <button type="button" className="billing-refresh-button" aria-label="刷新任务消耗">
            <CreditCard size={14} />
          </button>
        </div>

        <TableShell
          columns={['详情说明', '日期', '积分变化 (Credits)']}
          rows={consumptionRows}
          emptyText="还没有任务消耗记录。"
        />
      </Panel>
    </div>
  )
}
