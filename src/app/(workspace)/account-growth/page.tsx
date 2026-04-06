'use client'

import { BadgeCheck, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { useApiQuery } from '@/hooks/use-api-query'
import { Panel, PrimaryButton, StatusPill } from '@/components/ui/surface'

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
    highlight: '提升账号可信度',
    benefit: '真实历史',
    description: '所有互动水位都先进入订单与任务模型，方便后端做可审计的流转管理。',
    icon: BadgeCheck,
    recommended: true,
  },
  {
    title: '自动互动',
    highlight: '稳定提升活跃度',
    benefit: '自动触发',
    description: '每次新增服务、订阅和订单都会带着完整的业务状态进入后台视图。',
    icon: Sparkles,
    recommended: false,
  },
  {
    title: '矩阵增长',
    highlight: '放大整体影响力',
    benefit: '多账号协同',
    description: '管理员可以从一个后台查看谁下单了、买了什么、当前进度和积分变化。',
    icon: Shield,
    recommended: true,
  },
] as const

const previewPlans = [
  {
    title: '入门增长',
    meta: '适合刚开始搭建内容节奏的账号',
    metric: '20-30',
  },
  {
    title: '持续互动',
    meta: '自动化承接日常点赞与评论需求',
    metric: '50-80',
  },
  {
    title: '矩阵放大',
    meta: '面向需要协同增长的长期计划',
    metric: '200-300',
  },
] as const

export default function AccountGrowthPage() {
  const { data } = useApiQuery<DashboardResponse>('/api/dashboard')
  const hasSubscriptions = (data?.subscriptions?.length ?? 0) > 0

  return (
    <div className="page-stack page-stack--growth">
      <section className="dashboard-section">
        <div className="dashboard-section__title-row">
          <div>
            <SectionTitleLike>增长计划</SectionTitleLike>
            <p className="services-subcopy">围绕真实账号、自动互动和矩阵协同，构建更长期、更稳定的增长结构。</p>
          </div>
          <span className="dashboard-section__meta">3 套计划</span>
        </div>

        <div className="growth-plan-grid">
          {valueCards.map(({ title, highlight, benefit, description, icon: Icon, recommended }) => (
            <Panel key={title} className="growth-plan-card">
              {recommended ? <span className="growth-plan-card__badge">推荐</span> : null}
              <div className="growth-plan-card__icon">
                <Icon size={24} />
              </div>
              <div className="growth-plan-card__copy">
                <div className="growth-plan-card__header">
                  <h3>{title}</h3>
                  <span className="growth-plan-card__benefit">{benefit}</span>
                </div>
                <strong>{highlight}</strong>
                <p>{description}</p>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      {hasSubscriptions ? (
        <Panel className="quota-card">
          <div className="panel-heading">
            <div>
              <h3>已激活订阅</h3>
              <p>当前账户已开通的订阅方案。</p>
            </div>
          </div>
          <div className="quota-list">
            {data?.subscriptions.map((subscription) => (
              <div key={subscription.id} className="quota-row">
                <strong>{subscription.plan.name}</strong>
                <span>到期：{new Date(subscription.endAt).toLocaleDateString('zh-CN')}</span>
                <StatusPill>{subscription.status}</StatusPill>
              </div>
            ))}
          </div>
        </Panel>
      ) : (
        <Panel className="growth-preview-panel">
          <div className="panel-heading dashboard-panel-heading">
            <div>
              <SectionTitleLike>计划预览</SectionTitleLike>
              <p>还没有开启增长计划，先挑一个适合你的订阅方案，把任务、互动和订单都接入统一控制台。</p>
            </div>
            <span className="dashboard-panel-badge">预览模式</span>
          </div>

          <div className="growth-preview-panel__body">
            <div className="growth-preview-grid" aria-hidden="true">
              {previewPlans.map((plan) => (
                <div key={plan.title} className="growth-preview-card">
                  <div className="growth-preview-card__head">
                    <strong>{plan.title}</strong>
                    <span>{plan.metric}</span>
                  </div>
                  <p>{plan.meta}</p>
                  <div className="growth-preview-card__bars">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>

            <div className="growth-preview-panel__copy">
              <span className="empty-state__eyebrow">订阅方案</span>
              <h3>还没有开启增长计划</h3>
              <p>订阅后即可开启长期自动化增长，管理员后台也会同步出现完整订单信息。</p>
              <Link href="/plans">
                <PrimaryButton>立即订阅</PrimaryButton>
              </Link>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}

function SectionTitleLike({ children }: { children: React.ReactNode }) {
  return <div className="section-title">{children}</div>
}
