'use client'

import {
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  Zap,
  Sparkles,
  Layers3,
  BarChart3,
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
    category: 'SERVICE_PLAN' | 'SUBSCRIPTION_PLAN'
    priceUsd: number
    usdCost: number | null
    durationDays: number | null
    isFeatured: boolean
    features: string[]
  }>
}

const servicePackIcons = [Layers3, Sparkles, Zap, BarChart3] as const

const featureLabels = ['关注', '点赞', '转发', '评论', '收藏'] as const
const featureIcons = [UserPlus, Heart, Repeat2, MessageCircle, Bookmark] as const
const subFeatureLabels = ['点赞', '评论', '转发', '收藏'] as const
const subFeatureIcons = [Heart, MessageCircle, Repeat2, Bookmark] as const

function parseFeatureValues(features: string[]): string[] {
  return featureLabels.map((label) => {
    const match = features.find((f) => f.includes(label))
    if (!match) return '-'
    const num = match.replace(label, '').trim()
    return num || '-'
  })
}

function parseSubFeatureValues(features: string[]): string[] {
  return subFeatureLabels.map((label) => {
    const match = features.find((f) => f.includes(label))
    if (!match) return '-'
    const num = match.replace(label, '').trim()
    return num || '-'
  })
}

export default function PlansPage() {
  const { identityToken } = useSession()
  const { data: plansData } = useApiQuery<PlansResponse>('/api/plans')
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState('')

  const servicePlans = useMemo(
    () => (plansData?.plans ?? []).filter((p) => p.category === 'SERVICE_PLAN'),
    [plansData?.plans],
  )

  const subscriptionPlans = useMemo(
    () => (plansData?.plans ?? []).filter((p) => p.category === 'SUBSCRIPTION_PLAN'),
    [plansData?.plans],
  )

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
          const Icon = servicePackIcons[index] ?? servicePackIcons[servicePackIcons.length - 1]
          const values = parseFeatureValues(plan.features)
          const originalPrice = Math.round(plan.priceUsd * 1.1)
          const isAccelerated = plan.slug === 'momentum-pack' || plan.slug === 'scale-pack'

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
                <span className="plan-card__price-old">${originalPrice}</span>
              </div>

              <p className="plan-card__description">{plan.description}</p>

              <div className="plan-card__meta-row">
                <span>增长速度</span>
                <div className="plan-card__meta-badges">
                  <span className="plan-card__mini-badge">标准</span>
                  {isAccelerated ? <span className="plan-card__mini-badge plan-card__mini-badge--accent">加速</span> : null}
                </div>
              </div>

              <ul className="plan-card__feature-grid">
                {featureLabels.map((label, idx) => {
                  const FeatureIcon = featureIcons[idx]
                  return (
                    <li key={label}>
                      <span className="plan-card__feature-label">
                        <FeatureIcon size={14} />
                        {label}
                      </span>
                      <strong>{values[idx]}</strong>
                    </li>
                  )
                })}
              </ul>

              {plan.isFeatured ? (
                <PrimaryButton onClick={() => void purchasePlan(plan.slug)} disabled={pendingSlug === plan.slug}>
                  {pendingSlug === plan.slug ? '创建中...' : '立即购买'}
                </PrimaryButton>
              ) : (
                <SecondaryButton onClick={() => void purchasePlan(plan.slug)} disabled={pendingSlug === plan.slug}>
                  {pendingSlug === plan.slug ? '创建中...' : '立即购买'}
                </SecondaryButton>
              )}
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
          const isEnterprise = plan.slug === 'enterprise-sub'
          const values = parseSubFeatureValues(plan.features)

          return (
            <Panel key={plan.id} className="plan-card plan-card--subscription-refined">
              <div className="plan-card__head">
                <h3>{plan.name}</h3>
                <div className="plan-card__price-row">
                  <strong>{isEnterprise ? '自定义' : `$${plan.priceUsd}`}</strong>
                  {!isEnterprise ? <span>/月</span> : null}
                </div>
                <p>{plan.description}</p>
              </div>

              <ul className="plan-card__subscription-list">
                {isEnterprise ? null : subFeatureLabels.map((label, idx) => {
                  const FeatureIcon = subFeatureIcons[idx]
                  return (
                    <li key={label}>
                      <span className="plan-card__feature-label">
                        <FeatureIcon size={14} />
                        {label}
                      </span>
                      <strong>{values[idx]}</strong>
                    </li>
                  )
                })}
              </ul>

              {isEnterprise ? (
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
          <input placeholder="请输入兑换码" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value)} />
          <SecondaryButton disabled>兑换</SecondaryButton>
        </div>
      </Panel>
    </div>
  )
}
