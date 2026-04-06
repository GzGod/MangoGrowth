'use client'

import { MessageSquareText, Quote, Repeat2, Send, Star, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useApiQuery } from '@/hooks/use-api-query'
import { useSession } from '@/components/providers/session-provider'
import { apiFetch } from '@/lib/client/api'
import { EmptyState, Panel, PrimaryButton, TableShell, StatusPill } from '@/components/ui/surface'

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

const serviceActionCards = [
  { value: 'FOLLOW', title: '关注', description: '面向目标账号建立真实关注关系，增强账号基础体量。', icon: UserPlus },
  { value: 'LIKE', title: '点赞', description: '为内容带来更直接的互动反馈，提升内容热度感知。', icon: Star },
  { value: 'REPOST', title: '转发', description: '增强内容传播范围，让优质内容持续获得曝光。', icon: Repeat2 },
  { value: 'COMMENT', title: '评论', description: '补充讨论氛围和互动深度，提升内容现场感。', icon: MessageSquareText },
  { value: 'BOOKMARK', title: '收藏', description: '增加内容被保存的迹象，强化内容价值感。', icon: Send },
  { value: 'QUOTE', title: '引用', description: '构建更强的社交关联和扩散链路，形成二次传播。', icon: Quote },
] as const

export default function ServicesPage() {
  const { identityToken } = useSession()
  const { data, refetch } = useApiQuery<TasksResponse>('/api/tasks')
  const [taskType, setTaskType] = useState<'FOLLOW' | 'LIKE' | 'REPOST' | 'COMMENT' | 'BOOKMARK' | 'QUOTE'>('FOLLOW')
  const [targetAccount, setTargetAccount] = useState('@your_target')
  const [targetPostUrl, setTargetPostUrl] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitTask = async () => {
    if (!identityToken) return
    setIsSubmitting(true)
    try {
      await apiFetch('/api/tasks', identityToken, {
        method: 'POST',
        body: JSON.stringify({
          type: taskType,
          targetAccount,
          targetPostUrl,
          note,
        }),
      })
      setNote('')
      setTargetPostUrl('')
      await refetch()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack page-stack--services">
      <Panel className="notice-bar">
        <span className="notice-dot" />
        <p>MangoGrowth 的任务系统用于演示完整的 SaaS 下单、任务流转和管理后台记录。</p>
      </Panel>

      <section className="hero-copy hero-copy--tight">
        <h2>创建增长任务</h2>
        <p>选择互动类型，填写目标账号和链接，系统会把任务记录到订单与管理后台中。</p>
      </section>

      <div className="services-grid">
        {serviceActionCards.map((card) => {
          const Icon = card.icon
          const isActive = card.value === taskType

          return (
            <button
              key={card.value}
              type="button"
              className={`service-card service-card--selectable${isActive ? ' is-active' : ''}`}
              onClick={() => setTaskType(card.value)}
            >
              <span className="service-card__icon">
                <Icon size={32} />
              </span>
              <span className="service-card__copy">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </span>
            </button>
          )
        })}
      </div>

      <Panel className="task-form-card">
        <div className="panel-heading">
          <div>
            <h3>创建任务</h3>
            <p>提交后任务会进入队列，并同步出现在你的订单和管理员后台中。</p>
          </div>
        </div>

        <div className="task-form">
          <label>
            <span>任务类型</span>
            <select value={taskType} onChange={(event) => setTaskType(event.target.value as typeof taskType)}>
              <option value="FOLLOW">关注</option>
              <option value="LIKE">点赞</option>
              <option value="REPOST">转发</option>
              <option value="COMMENT">评论</option>
              <option value="BOOKMARK">收藏</option>
              <option value="QUOTE">引用</option>
            </select>
          </label>

          <label>
            <span>目标账号</span>
            <input placeholder="例如 @mangogrowth" value={targetAccount} onChange={(event) => setTargetAccount(event.target.value)} />
          </label>

          <label>
            <span>目标链接</span>
            <input placeholder="可选：填写帖子或页面链接" value={targetPostUrl} onChange={(event) => setTargetPostUrl(event.target.value)} />
          </label>

          <label>
            <span>备注说明</span>
            <input placeholder="填写任务说明或补充信息" value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
        </div>

        <PrimaryButton className="task-form__submit" onClick={() => void submitTask()} disabled={isSubmitting || !targetAccount.trim()}>
          {isSubmitting ? '提交中...' : '提交任务'}
        </PrimaryButton>
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>任务记录</h3>
            <p>最近创建的任务会出现在这里。</p>
          </div>
        </div>
        <TableShell
          columns={['任务 ID', '类型', '状态', '目标账号', '创建时间']}
          rows={(data?.tasks ?? []).map((task) => [
            task.id,
            task.type,
            <StatusPill key={`${task.id}-status`}>{task.status}</StatusPill>,
            task.targetAccount,
            new Date(task.createdAt).toLocaleString('zh-CN'),
          ])}
          emptyState={
            <EmptyState
              title="还没有任何任务哦～"
              description="先选择一个互动类型并提交任务，系统会在这里展示记录和状态变化。"
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
  )
}
