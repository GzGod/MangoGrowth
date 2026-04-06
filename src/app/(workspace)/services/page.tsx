'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

import { useApiQuery } from '@/hooks/use-api-query'
import { useSession } from '@/components/providers/session-provider'
import { apiFetch } from '@/lib/client/api'
import { serviceActionCards } from '@/lib/data/dashboard'
import { Panel, PrimaryButton, TableShell, StatusPill } from '@/components/ui/surface'

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

export default function ServicesPage() {
  const { identityToken } = useSession()
  const { data, refetch } = useApiQuery<TasksResponse>('/api/tasks')
  const [taskType, setTaskType] = useState<'FOLLOW' | 'LIKE' | 'REPOST' | 'COMMENT' | 'BOOKMARK' | 'QUOTE'>('FOLLOW')
  const [targetAccount, setTargetAccount] = useState('@your_target')
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
          note,
        }),
      })
      setNote('')
      await refetch()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <Panel className="notice-bar">
        <span className="notice-dot" />
        <p>MangoGrowth 的任务系统只做通用 SaaS 流转演示，不包含真实支付和外部执行引擎。</p>
      </Panel>

      <section className="hero-copy hero-copy--tight">
        <h2>创建增长任务</h2>
        <p>选择你需要的互动类型，系统会把任务记录到订单与管理员后台里。</p>
      </section>

      <div className="grid-three">
        {serviceActionCards.map((card) => (
          <Panel key={card.title} className="service-card">
            <div className="service-card__icon">
              <Send size={18} />
            </div>
            <div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="task-form-card">
        <div className="panel-heading">
          <div>
            <h3>创建任务</h3>
            <p>这里的任务会进入队列并展示在你的账户和管理员后台中。</p>
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
            <input value={targetAccount} onChange={(event) => setTargetAccount(event.target.value)} />
          </label>

          <label className="task-form__wide">
            <span>备注</span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
          </label>
        </div>

        <PrimaryButton onClick={() => void submitTask()} disabled={isSubmitting || !targetAccount.trim()}>
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
          emptyText="还没有任务，先创建一个。"
        />
      </Panel>
    </div>
  )
}
