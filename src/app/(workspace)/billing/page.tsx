'use client'

import Link from 'next/link'
import { CircleDollarSign, UserRound, WalletCards } from 'lucide-react'

import { UsageChart } from '@/components/charts/usage-chart'
import { useSession } from '@/components/providers/session-provider'
import { useApiQuery } from '@/hooks/use-api-query'
import { usageData } from '@/lib/data/dashboard'
import { EmptyState, Panel, PrimaryButton, StatCard, StatusPill, TableShell } from '@/components/ui/surface'

type DashboardResponse = {
  metrics: {
    balance: number
    orderCount: number
    spentCredits: number
  }
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
  const { user } = useSession()
  const { data } = useApiQuery<DashboardResponse>('/api/dashboard')

  return (
    <div className="page-stack">
      <div className="grid-three">
        <Panel className="profile-card">
          <span className="profile-card__label">我的资料</span>
          <div className="profile-card__row">
            <div>
              <strong>{user?.email ?? '未绑定邮箱'}</strong>
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
          description="这里保留给后续支付回执、发票和账单周期统计。"
          action={
            <Link href="/plans">
              <PrimaryButton>购买套餐</PrimaryButton>
            </Link>
          }
        />
      </section>

      <Panel className="chart-card">
        <div className="chart-card__header">
          <div>
            <h3>使用量</h3>
            <p>(1,000 Credits)</p>
          </div>
          <div className="chart-card__ranges">
            <button type="button" className="is-active">
              最近7天
            </button>
            <button type="button">最近30天</button>
            <button type="button">最近3个月</button>
          </div>
        </div>
        <UsageChart data={usageData} />
      </Panel>

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
          emptyText="还没有充值订单。"
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
          emptyText="还没有积分流水。"
        />
      </Panel>
    </div>
  )
}
