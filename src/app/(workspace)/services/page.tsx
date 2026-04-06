'use client'

import { useMemo, useState } from 'react'
import {
  Bookmark,
  CircleAlert,
  Eye,
  Heart,
  MessageCircle,
  Plus,
  Quote,
  Repeat2,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'

import { useApiQuery } from '@/hooks/use-api-query'
import { useSession } from '@/components/providers/session-provider'
import { apiFetch } from '@/lib/client/api'
import { EmptyState, Panel, PrimaryButton, SecondaryButton, StatusPill, TableShell } from '@/components/ui/surface'

type TaskType = 'FOLLOW' | 'LIKE' | 'REPOST' | 'COMMENT' | 'BOOKMARK' | 'QUOTE'
type SpeedKey = 'STANDARD' | 'BOOST' | 'TURBO'

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

type TaskDraft = {
  target: string
  quantity: string
  speed: SpeedKey
}

const speedOptions: Array<{ key: SpeedKey; title: string; range: string; price: number }> = [
  { key: 'STANDARD', title: 'Standard', range: '30 - 50/天', price: 10 },
  { key: 'BOOST', title: 'Boost', range: '150 - 200/天', price: 16 },
  { key: 'TURBO', title: 'Turbo', range: '400 - 500/天', price: 28 },
]

const serviceCards: Array<{
  type: TaskType
  title: string
  description: string
  icon: typeof UserPlus
  targetLabel: string
  targetPlaceholder: string
  quantityLabel: string
  usesUrl?: boolean
}> = [
  {
    type: 'FOLLOW',
    title: '关注',
    description: '用真实用户的关注行为补齐账号基础体量，适合持续增长。',
    icon: UserPlus,
    targetLabel: '目标用户名',
    targetPlaceholder: '@username',
    quantityLabel: '关注数量',
  },
  {
    type: 'LIKE',
    title: '点赞',
    description: '获得更直接的互动反馈，为内容建立早期热度和社交证明。',
    icon: Heart,
    targetLabel: '目标推文地址',
    targetPlaceholder: 'https://x.com/username/status/1234567890',
    quantityLabel: '点赞数量',
    usesUrl: true,
  },
  {
    type: 'REPOST',
    title: '转发',
    description: '通过转发加快内容扩散节奏，让优质内容获得更广触达。',
    icon: Repeat2,
    targetLabel: '目标推文地址',
    targetPlaceholder: 'https://x.com/username/status/1234567890',
    quantityLabel: '转发数量',
    usesUrl: true,
  },
  {
    type: 'COMMENT',
    title: '评论',
    description: '生成真实评论氛围，提升讨论深度与内容互动感。',
    icon: MessageCircle,
    targetLabel: '目标推文地址',
    targetPlaceholder: 'https://x.com/username/status/1234567890',
    quantityLabel: '评论数量',
    usesUrl: true,
  },
  {
    type: 'BOOKMARK',
    title: '收藏',
    description: '增加真实用户收藏信号，帮助内容建立长期兴趣标签。',
    icon: Bookmark,
    targetLabel: '目标推文地址',
    targetPlaceholder: 'https://x.com/username/status/1234567890',
    quantityLabel: '收藏数量',
    usesUrl: true,
  },
  {
    type: 'QUOTE',
    title: '引用',
    description: '引用真实推文并形成二次传播节点，让讨论链路更自然。',
    icon: Quote,
    targetLabel: '目标推文地址',
    targetPlaceholder: 'https://x.com/username/status/1234567890',
    quantityLabel: '引用数量',
    usesUrl: true,
  },
]

const initialDraft = (): TaskDraft => ({
  target: '',
  quantity: '',
  speed: 'STANDARD',
})

export default function ServicesPage() {
  const { identityToken, user } = useSession()
  const { data, refetch } = useApiQuery<TasksResponse>('/api/tasks')
  const [selectedTypes, setSelectedTypes] = useState<TaskType[]>([])
  const [drafts, setDrafts] = useState<Record<TaskType, TaskDraft>>({
    FOLLOW: initialDraft(),
    LIKE: initialDraft(),
    REPOST: initialDraft(),
    COMMENT: initialDraft(),
    BOOKMARK: initialDraft(),
    QUOTE: initialDraft(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleType = (type: TaskType) => {
    setSelectedTypes((current) => {
      if (current.includes(type)) {
        return current.filter((item) => item !== type)
      }

      return [...current, type]
    })
  }

  const updateDraft = (type: TaskType, patch: Partial<TaskDraft>) => {
    setDrafts((current) => ({
      ...current,
      [type]: {
        ...current[type],
        ...patch,
      },
    }))
  }

  const selectedConfigs = selectedTypes
    .map((type) => {
      const config = serviceCards.find((card) => card.type === type)
      return config ? { config, draft: drafts[type] } : null
    })
    .filter((item): item is { config: (typeof serviceCards)[number]; draft: TaskDraft } => Boolean(item))

  const summary = useMemo(() => {
    return selectedConfigs.reduce(
      (acc, item) => {
        const quantity = Number(item.draft.quantity || 0)
        const speed = speedOptions.find((option) => option.key === item.draft.speed) ?? speedOptions[0]
        acc.expected += speed.price * quantity
        acc.count += quantity
        return acc
      },
      { expected: 0, count: 0 },
    )
  }, [selectedConfigs])

  const canSubmit =
    selectedConfigs.length > 0 &&
    selectedConfigs.every(({ draft }) => draft.target.trim() && Number(draft.quantity) > 0)

  const submitTasks = async () => {
    if (!identityToken || !canSubmit) return
    setIsSubmitting(true)

    try {
      for (const { config, draft } of selectedConfigs) {
        const speed = speedOptions.find((option) => option.key === draft.speed) ?? speedOptions[0]
        await apiFetch('/api/tasks', identityToken, {
          method: 'POST',
          body: JSON.stringify({
            type: config.type,
            targetAccount: draft.target,
            targetPostUrl: config.usesUrl ? draft.target : null,
            note: `数量：${draft.quantity}；速度：${speed.title}；单价：${speed.price} 积分`,
          }),
        })
      }

      setSelectedTypes([])
      setDrafts({
        FOLLOW: initialDraft(),
        LIKE: initialDraft(),
        REPOST: initialDraft(),
        COMMENT: initialDraft(),
        BOOKMARK: initialDraft(),
        QUOTE: initialDraft(),
      })
      await refetch()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack page-stack--services">
      <Panel className="notice-bar services-notice">
        <span className="notice-dot" />
        <p>所有增长任务都进入订单与后台记录，当前版本演示任务创建与流转，不执行真实外部动作。</p>
      </Panel>

      <section className="hero-copy hero-copy--tight services-hero">
        <h2>创建增长任务</h2>
        <p>选择你需要的增长动作，MangoGrowth 会按任务类型逐项生成配置卡片。</p>
      </section>

      <div className="services-picker-grid">
        {serviceCards.map((card) => {
          const Icon = card.icon
          const isActive = selectedTypes.includes(card.type)

          return (
            <button
              key={card.type}
              type="button"
              className={`services-picker-card${isActive ? ' is-active' : ''}`}
              onClick={() => toggleType(card.type)}
            >
              <span className="services-picker-card__icon">
                <Icon size={22} />
              </span>
              <span className="services-picker-card__copy">
                <strong>{card.title}</strong>
                <span>{card.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      {selectedConfigs.length > 0 ? (
        <div className="services-config-list">
          {selectedConfigs.map(({ config, draft }) => {
            const Icon = config.icon
            const speed = speedOptions.find((option) => option.key === draft.speed) ?? speedOptions[0]
            const quantity = Number(draft.quantity || 0)

            return (
              <Panel key={config.type} className="service-task-panel">
                <div className="service-task-panel__header">
                  <div className="service-task-panel__title">
                    <span className="service-task-panel__icon">
                      <Icon size={18} />
                    </span>
                    <strong>{config.title}</strong>
                  </div>
                  <span className="service-task-panel__price">10 积分/单位</span>
                </div>

                <div className="service-task-panel__form">
                  <label>
                    <span>{config.targetLabel}</span>
                    <input
                      placeholder={config.targetPlaceholder}
                      value={draft.target}
                      onChange={(event) => updateDraft(config.type, { target: event.target.value })}
                    />
                  </label>

                  <label>
                    <span>{config.quantityLabel}</span>
                    <input
                      placeholder="多少个？"
                      value={draft.quantity}
                      onChange={(event) => updateDraft(config.type, { quantity: event.target.value.replace(/[^\d]/g, '') })}
                    />
                  </label>
                </div>

                <div className="service-task-panel__verify">
                  <span className="service-task-panel__hint">
                    <CircleAlert size={14} />
                    请先核对信息并通过验证后才能使用此服务
                  </span>
                  <SecondaryButton className="service-task-panel__verify-button" disabled>
                    <Eye size={14} />
                    核对信息
                  </SecondaryButton>
                </div>

                <div className="service-task-panel__speed">
                  <div className="service-task-panel__speed-label">
                    增长速度
                    <CircleAlert size={12} />
                  </div>

                  <div className="service-speed-grid">
                    {speedOptions.map((option) => {
                      const isSelected = draft.speed === option.key
                      return (
                        <button
                          key={option.key}
                          type="button"
                          className={`service-speed-card${isSelected ? ' is-selected' : ''}`}
                          onClick={() => updateDraft(config.type, { speed: option.key })}
                        >
                          <div className="service-speed-card__top">
                            <span className="service-speed-card__name">{option.title}</span>
                            {isSelected ? <ShieldCheck size={16} /> : null}
                          </div>
                          <div className="service-speed-card__range">{option.range}</div>
                          <div className="service-speed-card__bottom">
                            <span>单价</span>
                            <strong>{option.price} 积分</strong>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="service-task-panel__total">
                  {speed.price} 积分 × {quantity} = {(speed.price * quantity).toLocaleString()} 积分
                </div>
              </Panel>
            )
          })}

          <Panel className="services-summary-bar">
            <div className="services-summary-bar__stats">
              <div>
                <span>可用</span>
                <strong>{(user?.creditBalance ?? 0).toLocaleString()} 积分</strong>
              </div>
              <div>
                <span>预计费用</span>
                <strong>{summary.expected.toLocaleString()} 积分</strong>
              </div>
              <div>
                <span>剩余</span>
                <strong className="is-positive">{((user?.creditBalance ?? 0) - summary.expected).toLocaleString()} 积分</strong>
              </div>
            </div>

            <div className="services-summary-bar__actions">
              {!canSubmit ? <span className="services-summary-bar__warning">请填写输入内容</span> : null}
              <PrimaryButton onClick={() => void submitTasks()} disabled={isSubmitting || !canSubmit}>
                <Plus size={16} />
                {isSubmitting ? '创建中...' : '创建服务'}
              </PrimaryButton>
            </div>
          </Panel>
        </div>
      ) : null}

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
              title="还没有任务记录哦～"
              description="先从上方选择你需要的任务类型，系统会按你选择的项目逐项展开配置。"
              action={<PrimaryButton onClick={() => toggleType('FOLLOW')}>选择任务</PrimaryButton>}
              className="empty-state--table"
            />
          }
        />
      </Panel>
    </div>
  )
}
