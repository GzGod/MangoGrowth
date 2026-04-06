'use client'

import {
  Bookmark,
  Heart,
  Layers3,
  MessageCircle,
  Quote,
  Repeat2,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSession } from '@/components/providers/session-provider'
import { Panel, PrimaryButton, SecondaryButton } from '@/components/ui/surface'
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

const servicePlanVisuals = [
  { icon: Layers3, badge: '标准' },
  { icon: Sparkles, badge: '标准' },
  { icon: Zap, badge: '加速' },
  { icon: Zap, badge: '加速' },
] as const

const subscriptionFeatureIcons = [Heart, MessageCircle, Repeat2, Bookmark] as const

export default function PlansPage() {
  const { identityToken } = useSession()
  const { data: plansData } = useApiQuery<PlansResponse>('/api/plans')
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState('')

  const servicePlans = useMemo(
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
    } finally {
      setPendingSlug(null)
    }
  }

  return (
    <div className="page-stack page-stack--plans-refined">
      <section className="hero-copy plans-hero">
        <h2>选择服务套餐</h2>
        <p>选择适合您的增长服务套餐</p>
      </section>

      <div className="plan-grid plan-grid--services-refined">
        {servicePlans.map((plan, index) => {
          const visual = servicePlanVisuals[index] ?? servicePlanVisuals[servicePlanVisuals.length - 1]
          const Icon = visual.icon
          const listValues = plan.features.filter((feature) => /\d/.test(feature)).slice(0, 5)
          const listLabels = ['关注', '点赞', '转发', '评论', '收藏']

          return (
            <Panel key={plan.id} className={`plan-card plan-card--refined${plan.isFeatured ? ' is-featured' : ''}`}>
              {plan.isFeatured ? <span className="plan-card__badge">热门</span> : null}
              <div className="plan-card__topline">
                <span className="plan-card__topicon">
                  <Icon size={16} />
                </span>
                <h3>{plan.name}</h3>
              </div>

              <div className="plan-card__price-row">
                <strong>${plan.priceUsd}</strong>
                <span className="plan-card__price-old">${Math.round(plan.priceUsd * 1.25)}</span>
              </div>

              <p className="plan-card__description">{plan.description}</p>

              <div className="plan-card__meta-row">
                <span>增长速度</span>
                <div className="plan-card__meta-badges">
                  <span className="plan-card__mini-badge">{visual.badge}</span>
                  {plan.isFeatured ? <span className="plan-card__mini-badge plan-card__mini-badge--accent">加速</span> : null}
                </div>
              </div>

              <ul className="plan-card__feature-grid">
                {listLabels.map((label, idx) => {
                  const FeatureIcon = [UserPlus, Heart, Repeat2, MessageCircle, Bookmark][idx]
                  return (
                    <li key={label}>
                      <span className="plan-card__feature-label">
                        <FeatureIcon size={14} />
                        {label}
                      </span>
                      <strong>{listValues[idx] ?? '-'}</strong>
                    </li>
                  )
                })}
              </ul>

              <PrimaryButton onClick={() => void createRecharge(plan.creditsGranted ?? 0, plan.priceUsd, plan.slug)} disabled={pendingSlug === plan.slug}>
                {pendingSlug === plan.slug ? '创建中...' : '立即购买'}
              </PrimaryButton>
            </Panel>
          )
        })}
      </div>

      <section className="hero-copy plans-hero plans-hero--secondary">
        <h2>选择您的订阅</h2>
        <p>选择最适合您需求的订阅，开启增长之旅</p>
      </section>

      <div className="plan-grid plan-grid--subscriptions-refined">
        {subscriptionPlans.map((plan) => {
          const numericFeatures = plan.features.filter((feature) => /\d/.test(feature)).slice(0, 4)

          return (
            <Panel key={plan.id} className="plan-card plan-card--subscription-refined">
              <div className="plan-card__head">
                <h3>{plan.name}</h3>
                <div className="plan-card__price-row">
                  <strong>{plan.slug.includes('enterprise') ? '自定义' : `$${plan.priceUsd}`}</strong>
                  {plan.slug.includes('enterprise') ? null : <span>/月</span>}
                </div>
                <p>{plan.description}</p>
              </div>

              <ul className="plan-card__subscription-list">
                {subscriptionFeatureIcons.map((FeatureIcon, index) => (
                  <li key={index}>
                    <span className="plan-card__feature-label">
                      <FeatureIcon size={14} />
                      {['点赞', '评论', '转发', '收藏'][index]}
                    </span>
                    <strong>{numericFeatures[index] ?? '-'}</strong>
                  </li>
                ))}
                {plan.slug.includes('enterprise') ? (
                  <li>
                    <span className="plan-card__feature-label">
                      <Quote size={14} />
                      支持
                    </span>
                    <strong>定制</strong>
                  </li>
                ) : null}
              </ul>

              {plan.slug.includes('enterprise') ? (
                <PrimaryButton onClick={() => void purchasePlan(plan.slug)} disabled={pendingSlug === plan.slug}>
                  联系我们
                </PrimaryButton>
              ) : (
                <SecondaryButton onClick={() => void purchasePlan(plan.slug)} disabled={pendingSlug === plan.slug}>
                  {pendingSlug === plan.slug ? '订阅中...' : '订阅'}
                </SecondaryButton>
              )}
            </Panel>
          )
        })}
      </div>

      <Panel className="redeem-card redeem-card--plans">
        <h3>兑换订阅码</h3>
        <p>输入您的兑换码以激活订阅计划</p>
        <div className="redeem-card__row">
          <input placeholder="请输入兑换码" value={redeemCode} onChange={(event) => setRedeemCode(event.target.value)} />
          <SecondaryButton disabled>兑换</SecondaryButton>
        </div>
      </Panel>
    </div>
  )
}
