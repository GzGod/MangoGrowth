'use client'

import { CircleDollarSign, Layers3, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSession } from '@/components/providers/session-provider'
import { EmptyState, Panel, PrimaryButton, SecondaryButton, StatCard, StatusPill, TableShell } from '@/components/ui/surface'
import { useApiQuery } from '@/hooks/use-api-query'
import { apiFetch } from '@/lib/client/api'

type PlansResponse = {
  plans: Array<{
    id: string
    slug: string
    name: string
    description: string
    category: 'CREDIT_PACK' | 'SERVICE_PLAN' | 'SUBSCRIPTION_PLAN'
    priceUsd: number
    creditsGranted: number | null
    creditsCost: number | null
    durationDays: number | null
    isFeatured: boolean
    features: string[]
  }>
}

type RechargeOrdersResponse = {
  rechargeOrders: Array<{
    id: string
    credits: number
    amountUsd: number
    status: string
    createdAt: string
  }>
}

type CreditsResponse = {
  balance: number
}

export default function PlansPage() {
  const { identityToken, refreshSession } = useSession()
  const { data: plansData } = useApiQuery<PlansResponse>('/api/plans')
  const { data: rechargeData, refetch: refetchRecharges } = useApiQuery<RechargeOrdersResponse>('/api/recharge-orders')
  const { data: creditsData, refetch: refetchCredits } = useApiQuery<CreditsResponse>('/api/credits/me')
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState('')

  const creditPlans = useMemo(
    () => (plansData?.plans ?? []).filter((plan) => plan.category === 'CREDIT_PACK'),
    [plansData?.plans],
  )
  const subscriptionPlans = useMemo(
    () => (plansData?.plans ?? []).filter((plan) => plan.category !== 'CREDIT_PACK'),
    [plansData?.plans],
  )

  const createRecharge = async (credits: number, amountUsd: number, slug: string) => {
    if (!identityToken) return
    setPendingSlug(slug)
    try {
      await apiFetch('/api/recharge-orders', identityToken, {
        method: 'POST',
        body: JSON.stringify({ credits, amountUsd }),
      })
      await Promise.all([refetchRecharges(), refetchCredits(), refreshSession()])
    } finally {
      setPendingSlug(null)
    }
  }

  const mockPay = async (orderId: string) => {
    if (!identityToken) return
    setPendingSlug(orderId)
    try {
      await apiFetch(`/api/recharge-orders/${orderId}/mock-pay`, identityToken, {
        method: 'POST',
      })
      await Promise.all([refetchRecharges(), refetchCredits(), refreshSession()])
    } finally {
      setPendingSlug(null)
    }
  }

  const purchasePlan = async (planSlug: string) => {
    if (!identityToken) return
    setPendingSlug(planSlug)
    try {
      await apiFetch('/api/orders', identityToken, {
        method: 'POST',
        body: JSON.stringify({ planSlug }),
      })
      await Promise.all([refetchCredits(), refreshSession()])
    } finally {
      setPendingSlug(null)
    }
  }

  return (
    <div className="page-stack page-stack--plans">
      <div className="grid-three page-metrics-grid">
        <StatCard label="当前积分余额" value={creditsData?.balance.toLocaleString() ?? '0'} icon={CircleDollarSign} />
        <StatCard label="积分套餐数量" value={creditPlans.length} icon={WalletCards} />
        <StatCard label="订阅方案数量" value={subscriptionPlans.length} icon={Layers3} />
      </div>

      <section className="hero-copy">
        <h2>选择服务套餐</h2>
        <p>先充值积分，再购买服务和订阅。真实支付网关已预留，这个版本先用占位支付流程演示。</p>
      </section>

      <Panel className="wallet-banner wallet-banner--plans">
        <div>
          <h3>当前积分余额</h3>
          <p>购买订阅和服务时会从这里直接扣除。</p>
        </div>
        <strong>{creditsData?.balance.toLocaleString() ?? '0'}</strong>
      </Panel>

      <div className="plan-grid plan-grid--credits">
        {creditPlans.map((plan) => (
          <Panel key={plan.id} className={`plan-card${plan.isFeatured ? ' is-featured' : ''}`}>
            {plan.isFeatured ? <span className="plan-card__badge">热门</span> : null}
            <div className="plan-card__head">
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
            </div>
            <div className="plan-card__price-row">
              <strong>${plan.priceUsd}</strong>
            </div>
            <ul className="plan-card__list">
              <li>
                <span className="plan-card__item-label">到账积分</span>
                <strong>{plan.creditsGranted?.toLocaleString()}</strong>
              </li>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span className="plan-card__item-label">{feature}</span>
                </li>
              ))}
            </ul>
            <PrimaryButton onClick={() => void createRecharge(plan.creditsGranted ?? 0, plan.priceUsd, plan.slug)} disabled={pendingSlug === plan.slug}>
              {pendingSlug === plan.slug ? '创建中...' : '创建充值单'}
            </PrimaryButton>
          </Panel>
        ))}
      </div>

      <section className="hero-copy hero-copy--tight">
        <h2>选择您的订阅</h2>
        <p>服务和订阅会直接消耗积分，下单后订单会同步出现在管理员后台。</p>
      </section>

      <div className="plan-grid plan-grid--subscriptions">
        {subscriptionPlans.map((plan) => (
          <Panel key={plan.id} className={`plan-card${plan.isFeatured ? ' is-featured' : ''}`}>
            {plan.isFeatured ? <span className="plan-card__badge">热门</span> : null}
            <div className="plan-card__head">
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
            </div>
            <div className="plan-card__price-row">
              <strong>${plan.priceUsd}</strong>
              {plan.durationDays ? <span>/{plan.durationDays} 天</span> : null}
            </div>
            <ul className="plan-card__list">
              <li>
                <span className="plan-card__item-label">所需积分</span>
                <strong>{plan.creditsCost?.toLocaleString()}</strong>
              </li>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span className="plan-card__item-label">{feature}</span>
                </li>
              ))}
            </ul>
            <PrimaryButton onClick={() => void purchasePlan(plan.slug)} disabled={pendingSlug === plan.slug}>
              {pendingSlug === plan.slug ? '下单中...' : '立即购买'}
            </PrimaryButton>
          </Panel>
        ))}
      </div>

      <Panel className="redeem-card">
        <h3>兑换订阅码</h3>
        <p>支付接入前，这里先保留兑换入口和布局。</p>
        <div className="redeem-card__row">
          <input placeholder="请输入兑换码" value={redeemCode} onChange={(event) => setRedeemCode(event.target.value)} />
          <SecondaryButton disabled>兑换</SecondaryButton>
        </div>
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>充值订单</h3>
            <p>点击“模拟支付到账”后，积分会实时入账。</p>
          </div>
        </div>
        <TableShell
          columns={['订单 ID', '积分', '金额', '状态', '创建时间', '操作']}
          rows={(rechargeData?.rechargeOrders ?? []).map((order) => [
            order.id,
            order.credits.toLocaleString(),
            `$${order.amountUsd}`,
            <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
            new Date(order.createdAt).toLocaleString('zh-CN'),
            order.status === 'PENDING' ? (
              <SecondaryButton key={`${order.id}-action`} onClick={() => void mockPay(order.id)} disabled={pendingSlug === order.id}>
                {pendingSlug === order.id ? '处理中...' : '模拟支付到账'}
              </SecondaryButton>
            ) : (
              '已完成'
            ),
          ])}
          emptyState={
            <EmptyState
              title="还没有任何充值订单哦～"
              description="先选择一个积分套餐创建充值单，成功后这里会自动展示完整订单记录。"
              action={
                <PrimaryButton onClick={() => void createRecharge(1000, 10, 'quick-recharge')}>
                  立即购买套餐
                </PrimaryButton>
              }
              className="empty-state--table"
            />
          }
        />
      </Panel>
    </div>
  )
}
