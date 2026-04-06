'use client'

import { CircleDollarSign, UserRound, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { UsageChart } from '@/components/charts/usage-chart'
import { useSession } from '@/components/providers/session-provider'
import { EmptyState, Panel, PrimaryButton, StatCard, StatusPill, TableShell } from '@/components/ui/surface'
import { useApiQuery } from '@/hooks/use-api-query'
import { resolveDisplayIdentity } from '@/lib/auth/identity'
import { usageRanges } from '@/lib/data/dashboard'

type UsageRangeKey = (typeof usageRanges)[number]['key']

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

export default function BillingPage() {
  const { user, authIdentity, isAuthenticated } = useSession()
  const { data } = useApiQuery<DashboardResponse>('/api/dashboard')
  const [activeRange, setActiveRange] = useState<UsageRangeKey>('last7')

  const chartData = useMemo(() => data?.usage?.[activeRange] ?? [], [activeRange, data])
  const displayIdentity = resolveDisplayIdentity(user, authIdentity, isAuthenticated)

  return (
    <div className="page-stack page-stack--billing">
      <div className="grid-three billing-top-grid">
        <Panel className="profile-card">
          <span className="profile-card__label">我的资料</span>
          <div className="profile-card__row">
            <div>
              <strong title={displayIdentity.title}>{displayIdentity.label}</strong>
              <p>{user?.name ?? 'Privy 用户'}</p>
            </div>
            <div className="metric-card__icon">
              <UserRound size={18} />
            </div>
          </div>
        </Panel>
        <StatCard label="我的积分" value={data?.metrics.balance.toLocaleString() ?? '0'} icon={CircleDollarSign} />
        <StatCard label="花费积分总数" value={data?.metrics.spentCredits.toLocaleString() ?? '0'} icon={WalletCards} />
      </div>

      <section>
        <div className="section-title">套餐配额</div>
        <EmptyState
          title="当前没有额外配额面板"
          description="这里会在后续展示支付回执、发票信息和账单周期统计。"
          action={
            <Link href="/plans">
              <PrimaryButton>购买套餐</PrimaryButton>
            </Link>
          }
          className="billing-quota-empty"
        />
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

      <div className="grid-two billing-ledger-grid">
        <Panel>
          <div className="panel-heading">
            <div>
              <h3>充值订单</h3>
              <p>展示最近的充值订单和支付状态。</p>
            </div>
          </div>
          <TableShell
            columns={['订单 ID', '积分', '金额', '状态', '创建时间']}
            rows={(data?.rechargeOrders ?? []).map((order) => [
              order.id,
              order.credits.toLocaleString(),
              `$${order.amountUsd}`,
              <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
              new Date(order.createdAt).toLocaleString('zh-CN'),
            ])}
            emptyState={
              <EmptyState
                title="还没有任何充值订单哦～"
                description="创建第一笔充值订单后，这里会自动展示金额、积分和支付状态。"
                action={
                  <Link href="/plans">
                    <PrimaryButton>立即购买套餐</PrimaryButton>
                  </Link>
                }
                className="empty-state--table"
              />
            }
          />
        </Panel>

        <Panel>
          <div className="panel-heading">
            <div>
              <h3>积分流水</h3>
              <p>记录充值、购买套餐和后续人工调整。</p>
            </div>
          </div>
          <TableShell
            columns={['流水 ID', '类型', '变动', '余额', '说明', '时间']}
            rows={(data?.transactions ?? []).map((transaction) => [
              transaction.id,
              transaction.type,
              transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount,
              transaction.balanceAfter.toLocaleString(),
              transaction.description,
              new Date(transaction.createdAt).toLocaleString('zh-CN'),
            ])}
            emptyState={
              <EmptyState
                title="还没有任何积分流水哦～"
                description="当你充值、购买套餐或收到管理员调整后，这里的流水记录会自动更新。"
                action={
                  <Link href="/plans">
                    <PrimaryButton>立即购买套餐</PrimaryButton>
                  </Link>
                }
                className="empty-state--table"
              />
            }
          />
        </Panel>
      </div>
    </div>
  )
}
