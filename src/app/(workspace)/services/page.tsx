'use client'

import { Bookmark, Heart, MessageCircle, Quote, Repeat2, Send, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { useSession } from '@/components/providers/session-provider'
import { EmptyState, Panel, PrimaryButton, StatusPill, TableShell } from '@/components/ui/surface'
import { useApiQuery } from '@/hooks/use-api-query'
import { apiFetch } from '@/lib/client/api'
import { serviceActionCards } from '@/lib/data/dashboard'

type TasksResponse = {
  tasks: Array<{
    id: string
    type: string
    status: string
    targetAccount: string
    targetPostUrl: string | null
    createdAt: string
  }>
}

const actionIcons = {
  FOLLOW: UserPlus,
  LIKE: Heart,
  REPOST: Repeat2,
  COMMENT: MessageCircle,
  BOOKMARK: Bookmark,
  QUOTE: Quote,
} as const

const actionLabels = {
  FOLLOW: '关注',
  LIKE: '点赞',
  REPOST: '转发',
  COMMENT: '评论',
  BOOKMARK: '收藏',
  QUOTE: '引用',
} as const

const actionCards = serviceActionCards.map((card, index) => {
  const key = ['FOLLOW', 'LIKE', 'REPOST', 'COMMENT', 'BOOKMARK', 'QUOTE'][index] as keyof typeof actionIcons
  return {
    ...card,
    key,
    icon: actionIcons[key],
  }
})

export default function ServicesPage() {
  const { identityToken } = useSession()
  const { data, refetch } = useApiQuery<TasksResponse>('/api/tasks')
  const [taskType, setTaskType] = useState<keyof typeof actionIcons>('FOLLOW')
  const [targetAccount, setTargetAccount] = useState('@mango_growth')
  const [targetUrl, setTargetUrl] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeCard = useMemo(() => actionCards.find((card) => card.key === taskType), [taskType])

  const submitTask = async () => {
    if (!identityToken) return
    setIsSubmitting(true)
    try {
      await apiFetch('/api/tasks', identityToken, {
        method: 'POST',
        body: JSON.stringify({
          type: taskType,
          targetAccount,
          targetPostUrl: targetUrl || null,
          note,
        }),
      })
      setTargetUrl('')
      setNote('')
      await refetch()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack page-stack--services">
      <Panel className="notice-bar">
        <span className="notice-dot" />
        <p>MangoGrowth 的任务系统只做通用 SaaS 流转演示，不包含真实支付和外部执行引擎。</p>
      </Panel>

      <section className="dashboard-section">
        <div className="dashboard-section__title-row">
          <div>
            <SectionTitleLike>选择互动任务类型</SectionTitleLike>
            <p className="services-subcopy">六种互动任务会统一进入订单与管理员后台，方便你集中查看和跟踪。</p>
          </div>
          <span className="dashboard-section__meta">6 类任务</span>
        </div>

        <div className="services-grid">
          {actionCards.map(({ key, title, description, icon: Icon }) => {
            const isActive = taskType === key

            return (
              <button
                key={key}
                type="button"
                className={`service-card service-card--selectable${isActive ? ' is-active' : ''}`}
                aria-pressed={isActive}
                aria-label={title}
                onClick={() => setTaskType(key)}
              >
                <div className="service-card__icon">
                  <Icon size={18} />
                </div>
                <div className="service-card__copy">
                  <div className="service-card__header">
                    <h3>{title}</h3>
                    {isActive ? <span className="service-card__badge">已选择</span> : null}
                  </div>
                  <p>{description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <Panel className="task-form-card task-form-card--elevated">
        <div className="panel-heading dashboard-panel-heading">
          <div>
            <SectionTitleLike>创建任务</SectionTitleLike>
            <p>当前正在配置「{activeCard?.title ?? actionLabels[taskType]}」任务，提交后会进入你的任务记录和管理员后台。</p>
          </div>
          <div className="service-form-chip">
            <Send size={14} />
            <span>{actionLabels[taskType]}</span>
          </div>
        </div>

        <div className="task-form task-form--modern">
          <label>
            <span>任务类型</span>
            <input value={actionLabels[taskType]} readOnly aria-label="任务类型" />
          </label>

          <label>
            <span>目标账号</span>
            <input
              placeholder="@mango_growth"
              value={targetAccount}
              onChange={(event) => setTargetAccount(event.target.value)}
            />
          </label>

          <label>
            <span>目标链接</span>
            <input
              placeholder="https://x.com/mango/status/123456789"
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
            />
          </label>

          <label>
            <span>执行目标</span>
            <input placeholder="例如：提升新帖互动热度、增强冷启动信号" readOnly value={`${actionLabels[taskType]}任务`} />
          </label>

          <label className="task-form__wide">
            <span>备注说明</span>
            <textarea
              placeholder="补充任务目标、语气或执行备注..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
            />
          </label>
        </div>

        <div className="task-form__actions">
          <PrimaryButton onClick={() => void submitTask()} disabled={isSubmitting || !targetAccount.trim()}>
            {isSubmitting ? '提交中...' : '立即创建任务'}
          </PrimaryButton>
          <Link href="/orders" className="inline-link">
            去查看订单与进度
          </Link>
        </div>
      </Panel>

      <section className="dashboard-section">
        <div className="dashboard-section__title-row">
          <div>
            <SectionTitleLike>任务记录</SectionTitleLike>
            <p className="services-subcopy">最近创建的任务会优先展示在这里，便于你回看当前执行状态。</p>
          </div>
        </div>

        {(data?.tasks ?? []).length > 0 ? (
          <Panel>
            <TableShell
              columns={['任务 ID', '类型', '状态', '目标账号', '创建时间']}
              rows={(data?.tasks ?? []).map((task) => [
                task.id,
                task.type,
                <StatusPill key={`${task.id}-status`}>{task.status}</StatusPill>,
                task.targetAccount,
                new Date(task.createdAt).toLocaleString('zh-CN'),
              ])}
            />
          </Panel>
        ) : (
          <EmptyState
            eyebrow="任务记录"
            title="还没有任何任务记录哦～"
            description="先选择一种互动类型并创建任务，系统会把执行记录同步沉淀到这里。"
            action={<PrimaryButton onClick={() => void submitTask()} disabled={isSubmitting || !targetAccount.trim()}>{isSubmitting ? '提交中...' : '立即创建任务'}</PrimaryButton>}
          />
        )}
      </section>
    </div>
  )
}

function SectionTitleLike({ children }: { children: React.ReactNode }) {
  return <div className="section-title">{children}</div>
}
