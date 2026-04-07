'use client'

import { ChevronDown, ChevronUp, Pencil, Plus, ShieldCheck, ShieldPlus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'

import { useAdminApiQuery } from '@/hooks/use-admin-api-query'
import { Panel, PrimaryButton, SecondaryButton, StatusPill, TableShell } from '@/components/ui/surface'

type AdminUsersResponse = {
  users: Array<{
    id: string
    email: string | null
    role: string
    usdBalance: number
    createdAt: string
  }>
}

type AdminTask = {
  id: string
  type: string
  status: string
  targetAccount: string
  targetPostUrl: string | null
  note: string | null
  createdAt: string
}

type AdminOrder = {
  id: string
  type: string
  status: string
  amountUsd: number
  usdCost: number
  progress: number
  createdAt: string
  completedAt: string | null
  plan: { id: string; name: string; category: string }
  user: { id: string; email: string | null; name: string | null; role: string } | null
  tasks: AdminTask[]
}

type AdminOrdersResponse = {
  orders: AdminOrder[]
}

type AdminRechargeOrdersResponse = {
  rechargeOrders: Array<{
    id: string
    amountUsd: number
    status: string
    createdAt: string
    user: { email: string | null } | null
  }>
}

type AdminTasksResponse = {
  tasks: Array<{
    id: string
    type: string
    status: string
    targetAccount: string
    createdAt: string
  }>
}

type AdminAccountsResponse = {
  admins: Array<{
    id: string
    username: string
    displayName: string | null
    createdByName: string | null
    createdAt: string
  }>
}

type AdminPlan = {
  id: string
  slug: string
  name: string
  description: string
  category: string
  priceUsd: number
  usdCost: number | null
  durationDays: number | null
  isFeatured: boolean
  isActive: boolean
  features: string[]
}

type AdminPlansResponse = {
  plans: AdminPlan[]
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? '请求失败')
  }

  return (await response.json()) as T
}

const PLAN_CATEGORIES = ['SERVICE_PLAN', 'SUBSCRIPTION_PLAN'] as const

const ORDER_STATUSES = ['PENDING', 'PAID', 'ACTIVE', 'COMPLETED', 'CANCELED'] as const

const EMPTY_PLAN_FORM = {
  slug: '',
  name: '',
  description: '',
  category: 'SERVICE_PLAN' as string,
  priceUsd: 0,
  usdCost: 0,
  durationDays: '',
  isFeatured: false,
  features: '',
}

function PlanFormPanel({
  initial,
  onSave,
  onCancel,
}: {
  initial?: AdminPlan
  onSave: () => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState(
    initial
      ? {
          slug: initial.slug,
          name: initial.name,
          description: initial.description,
          category: initial.category,
          priceUsd: initial.priceUsd,
          usdCost: initial.usdCost ?? 0,
          durationDays: initial.durationDays ? String(initial.durationDays) : '',
          isFeatured: initial.isFeatured,
          features: initial.features.join('\n'),
        }
      : EMPTY_PLAN_FORM,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      const body = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        category: form.category,
        priceUsd: Number(form.priceUsd),
        usdCost: Number(form.usdCost),
        durationDays: form.durationDays ? Number(form.durationDays) : undefined,
        isFeatured: form.isFeatured,
        features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      }
      if (initial) {
        await adminFetch(`/api/admin/plans/${initial.id}`, { method: 'PATCH', body: JSON.stringify(body) })
      } else {
        await adminFetch('/api/admin/plans', { method: 'POST', body: JSON.stringify(body) })
      }
      await onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-plan-form">
      <div className="admin-create-grid admin-create-grid--plans">
        <label className="field">
          <span>Slug（唯一标识）</span>
          <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="例如 trial-pack" disabled={!!initial} />
        </label>
        <label className="field">
          <span>套餐名称</span>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="例如 体验包 (Trial)" />
        </label>
        <label className="field">
          <span>类型</span>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {PLAN_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="field">
          <span>价格 (USD)</span>
          <input type="number" min={0} value={form.priceUsd} onChange={(e) => set('priceUsd', e.target.value)} />
        </label>
        <label className="field">
          <span>USD 消耗</span>
          <input type="number" min={0} value={form.usdCost} onChange={(e) => set('usdCost', e.target.value)} />
        </label>
        <label className="field">
          <span>有效天数（订阅填 30，一次性留空）</span>
          <input type="number" min={1} value={form.durationDays} onChange={(e) => set('durationDays', e.target.value)} placeholder="留空表示永久" />
        </label>
        <label className="field field--checkbox">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
          <span>热门推荐（isFeatured）</span>
        </label>
      </div>
      <label className="field">
        <span>描述</span>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="套餐描述文字" />
      </label>
      <label className="field">
        <span>服务量列表（每行一条，例如：关注 50）</span>
        <textarea value={form.features} onChange={(e) => set('features', e.target.value)} rows={5} placeholder={'关注 50\n点赞 20\n转发 10\n评论 5\n收藏 5'} />
      </label>
      {error && <p className="field-error">{error}</p>}
      <div className="modal-box__actions">
        <SecondaryButton onClick={onCancel}>取消</SecondaryButton>
        <PrimaryButton onClick={() => void handleSubmit()} disabled={saving}>
          {saving ? '保存中...' : initial ? '保存修改' : '创建套餐'}
        </PrimaryButton>
      </div>
    </div>
  )
}



function OrderDetailRow({
  order,
  colSpan,
  onUpdated,
}: {
  order: AdminOrder
  colSpan: number
  onUpdated: () => Promise<void>
}) {
  const [status, setStatus] = useState(order.status)
  const [progress, setProgress] = useState(String(order.progress))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await adminFetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, progress: Number(progress) }),
      })
      await onUpdated()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="order-detail-row">
      <td colSpan={colSpan} className="order-detail-cell">
        <div className="order-detail-content">
          <div className="order-detail-grid">
            <div className="order-detail-section">
              <h5>用户信息</h5>
              <p><span>邮箱</span><strong>{order.user?.email ?? '未知'}</strong></p>
              <p><span>用户 ID</span><strong className="order-detail-id">{order.user?.id ?? '-'}</strong></p>
            </div>
            <div className="order-detail-section">
              <h5>套餐信息</h5>
              <p><span>套餐名</span><strong>{order.plan.name}</strong></p>
              <p><span>类型</span><strong>{order.type}</strong></p>
              <p><span>金额</span><strong>${order.amountUsd}</strong></p>
              <p><span>USD 消耗</span><strong>${(order.usdCost / 100).toFixed(2)}</strong></p>
            </div>
            <div className="order-detail-section">
              <h5>更新状态</h5>
              <label className="field">
                <span>状态</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>进度 (0-100)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                />
              </label>
              {saveError ? <p className="field-error">{saveError}</p> : null}
              <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </PrimaryButton>
            </div>
          </div>

          {order.tasks.length > 0 ? (
            <div className="order-detail-tasks">
              <h5>关联任务 ({order.tasks.length})</h5>
              <table className="data-table data-table--compact">
                <thead>
                  <tr>
                    <th>类型</th>
                    <th>状态</th>
                    <th>目标账号</th>
                    <th>目标链接</th>
                    <th>备注</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {order.tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.type}</td>
                      <td><StatusPill>{task.status}</StatusPill></td>
                      <td>{task.targetAccount}</td>
                      <td>
                        {task.targetPostUrl ? (
                          <a href={task.targetPostUrl} target="_blank" rel="noopener noreferrer" className="order-detail-link">
                            查看
                          </a>
                        ) : '-'}
                      </td>
                      <td>{task.note ?? '-'}</td>
                      <td>{new Date(task.createdAt).toLocaleString('zh-CN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="order-detail-empty">暂无关联任务</p>
          )}
        </div>
      </td>
    </tr>
  )
}

export function AdminScreen({
  admin,
}: {
  admin: {
    id: string
    username: string
    displayName: string | null
  }
}) {
  const { data: usersData } = useAdminApiQuery<AdminUsersResponse>('/api/admin/users', true)
  const { data: ordersData, refetch: refetchOrders } = useAdminApiQuery<AdminOrdersResponse>('/api/admin/orders', true)
  const { data: rechargeData } = useAdminApiQuery<AdminRechargeOrdersResponse>('/api/admin/recharge-orders', true)
  const { data: tasksData } = useAdminApiQuery<AdminTasksResponse>('/api/admin/tasks', true)
  const { data: adminAccountsData, refetch: refetchAdminAccounts } = useAdminApiQuery<AdminAccountsResponse>('/api/admin/admin-users', true)
  const { data: plansData, refetch: refetchPlans } = useAdminApiQuery<AdminPlansResponse>('/api/admin/plans', true)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null)

  const handleCreateAdmin = async () => {
    setIsSubmitting(true)
    setFormError(null)
    try {
      await adminFetch('/api/admin/admin-users', {
        method: 'POST',
        body: JSON.stringify({ username, password, displayName }),
      })
      setUsername('')
      setPassword('')
      setDisplayName('')
      await refetchAdminAccounts()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '新增管理员失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await adminFetch('/api/admin/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  const adminAccounts = adminAccountsData?.admins ?? []
  const users = usersData?.users ?? []
  const orders = ordersData?.orders ?? []
  const rechargeOrders = rechargeData?.rechargeOrders ?? []
  const tasks = tasksData?.tasks ?? []
  const plans = plansData?.plans ?? []

  const handleTogglePlanActive = async (plan: AdminPlan) => {
    await adminFetch(`/api/admin/plans/${plan.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !plan.isActive }),
    })
    await refetchPlans()
  }

  const ORDER_COLUMNS = ['订单 ID', '下单用户', '订单名称', '状态', 'USD 消耗', '金额', '创建时间', '']

  return (
    <div className="page-stack page-stack--admin">
      <Panel className="notice-bar admin-notice-bar">
        <span className="notice-dot" />
        <p>
          当前使用独立管理员后台，和 Privy 用户端完全分离。当前管理员：
          <strong>{admin.displayName ?? admin.username}</strong>
        </p>
      </Panel>

      <Panel className="admin-panel admin-panel--hero">
        <div className="panel-heading admin-panel__heading">
          <div>
            <h3>管理员账号</h3>
            <p>使用独立管理员账号登录后台，可以继续添加新的后台管理员，并统一管理平台数据。</p>
          </div>
          <SecondaryButton onClick={() => void handleLogout()}>退出管理员后台</SecondaryButton>
        </div>

        <div className="admin-hero-grid">
          <div className="admin-highlight-card">
            <span className="admin-highlight-card__icon"><ShieldCheck size={18} /></span>
            <div>
              <strong>当前身份</strong>
              <p>{admin.displayName ?? admin.username}</p>
            </div>
          </div>
          <div className="admin-highlight-card">
            <span className="admin-highlight-card__icon"><ShieldPlus size={18} /></span>
            <div>
              <strong>管理员数量</strong>
              <p>{adminAccounts.length.toLocaleString()} 个账号</p>
            </div>
          </div>
          <div className="admin-highlight-card">
            <span className="admin-highlight-card__icon"><Users size={18} /></span>
            <div>
              <strong>平台用户</strong>
              <p>{users.length.toLocaleString()} 位注册用户</p>
            </div>
          </div>
        </div>

        <div className="admin-subsection">
          <div className="admin-subsection__heading">
            <div>
              <h4>添加新管理员</h4>
              <p>创建新的独立后台账号，添加后可直接使用管理员登录页进入控制台。</p>
            </div>
          </div>
          <div className="admin-create-grid">
            <label className="field">
              <span>管理员账号</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="例如 admin-root" />
            </label>
            <label className="field">
              <span>管理员密码</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="请输入新管理员密码" />
            </label>
            <label className="field">
              <span>显示名称</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="例如 运营主管" />
            </label>
          </div>
          {formError ? <p className="field-error">{formError}</p> : null}
          <div className="panel-actions panel-actions--admin">
            <PrimaryButton onClick={() => void handleCreateAdmin()} disabled={isSubmitting}>
              {isSubmitting ? '创建中...' : '添加新管理员'}
            </PrimaryButton>
          </div>
        </div>

        <div className="admin-subsection admin-subsection--table">
          <div className="admin-subsection__heading">
            <div>
              <h4>已有管理员</h4>
              <p>查看当前后台管理员账号、显示名称和创建来源。</p>
            </div>
          </div>
          <TableShell
            columns={['管理员账号', '显示名称', '创建人', '创建时间']}
            rows={adminAccounts.map((account) => [
              account.username,
              account.displayName ?? '-',
              account.createdByName ?? 'bootstrap',
              new Date(account.createdAt).toLocaleString('zh-CN'),
            ])}
            emptyText="当前还没有更多管理员账号。"
          />
        </div>
      </Panel>

      <Panel className="admin-panel admin-panel--table">
        <div className="panel-heading admin-panel__heading admin-panel__heading--table">
          <div>
            <h3>用户列表</h3>
            <p>查看所有注册用户的邮箱、角色、积分余额与注册时间。</p>
          </div>
        </div>
        <TableShell
          columns={['用户 ID', '邮箱', '角色', 'USD 余额', '注册时间']}
          rows={users.map((user) => [
            user.id,
            user.email ?? '未绑定邮箱',
            <StatusPill key={`${user.id}-role`}>{user.role}</StatusPill>,
            `$${(user.usdBalance / 100).toFixed(2)}`,
            new Date(user.createdAt).toLocaleString('zh-CN'),
          ])}
          emptyText="暂时没有用户数据。"
        />
      </Panel>

      <Panel className="admin-panel admin-panel--table">
        <div className="panel-heading admin-panel__heading admin-panel__heading--table">
          <div>
            <h3>购买订单</h3>
            <p>查看是谁下单、购买了什么、金额多少，以及当前状态。点击行末按钮展开详情。</p>
          </div>
        </div>
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                {ORDER_COLUMNS.map((col) => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={ORDER_COLUMNS.length} className="table-empty">暂时没有购买订单。</td>
                </tr>
              ) : orders.map((order) => (
                <>
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user?.email ?? '未知用户'}</td>
                    <td>{order.plan.name}</td>
                    <td><StatusPill>{order.status}</StatusPill></td>
                    <td>${(order.usdCost / 100).toFixed(2)}</td>
                    <td>${(order.amountUsd / 100).toFixed(2)}</td>
                    <td>{new Date(order.createdAt).toLocaleString('zh-CN')}</td>
                    <td>
                      <button
                        className="secondary-button secondary-button--icon"
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        aria-label={expandedOrderId === order.id ? '收起' : '展开'}
                      >
                        {expandedOrderId === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </td>
                  </tr>
                  {expandedOrderId === order.id ? (
                    <OrderDetailRow
                      key={`${order.id}-detail`}
                      order={order}
                      colSpan={ORDER_COLUMNS.length}
                      onUpdated={refetchOrders}
                    />
                  ) : null}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel className="admin-panel admin-panel--table">
        <div className="panel-heading admin-panel__heading admin-panel__heading--table">
          <div>
            <h3>套餐管理</h3>
            <p>上架、编辑或下架服务套餐与订阅套餐。</p>
          </div>
          <PrimaryButton onClick={() => { setEditingPlan(null); setShowPlanForm(true) }}>
            <Plus size={14} /> 新建套餐
          </PrimaryButton>
        </div>

        {(showPlanForm && !editingPlan) && (
          <PlanFormPanel
            onSave={async () => { await refetchPlans(); setShowPlanForm(false) }}
            onCancel={() => setShowPlanForm(false)}
          />
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>价格</th>
              <th>USD 消耗</th>
              <th>热门</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">暂无套餐数据。</td></tr>
            ) : plans.map((plan) => (
              <>
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td><StatusPill>{plan.category}</StatusPill></td>
                  <td>${(plan.priceUsd / 100).toFixed(2)}</td>
                  <td>${((plan.usdCost ?? 0) / 100).toFixed(2)}</td>
                  <td>{plan.isFeatured ? '✓' : '-'}</td>
                  <td><StatusPill>{plan.isActive ? 'ACTIVE' : 'INACTIVE'}</StatusPill></td>
                  <td className="admin-plan-actions">
                    <button
                      className="secondary-button secondary-button--icon"
                      aria-label="编辑"
                      onClick={() => { setEditingPlan(plan); setShowPlanForm(true) }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="secondary-button secondary-button--icon"
                      aria-label={plan.isActive ? '下架' : '上架'}
                      onClick={() => void handleTogglePlanActive(plan)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
                {editingPlan?.id === plan.id && showPlanForm && (
                  <tr key={`${plan.id}-edit`}>
                    <td colSpan={7} className="order-detail-cell">
                      <PlanFormPanel
                        initial={editingPlan}
                        onSave={async () => { await refetchPlans(); setShowPlanForm(false); setEditingPlan(null) }}
                        onCancel={() => { setShowPlanForm(false); setEditingPlan(null) }}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel className="admin-panel admin-panel--table">
        <div className="panel-heading admin-panel__heading admin-panel__heading--table">
          <div>
            <h3>充值订单</h3>
            <p>查看充值金额、积分额度与支付状态。</p>
          </div>
        </div>
        <TableShell
          columns={['充值单 ID', '用户', '金额', '状态', '创建时间']}
          rows={rechargeOrders.map((order) => [
            order.id,
            order.user?.email ?? '未知用户',
            `$${(order.amountUsd / 100).toFixed(2)}`,
            <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
            new Date(order.createdAt).toLocaleString('zh-CN'),
          ])}
          emptyText="暂时没有充值订单。"
        />
      </Panel>

      <Panel className="admin-panel admin-panel--table">
        <div className="panel-heading admin-panel__heading admin-panel__heading--table">
          <div>
            <h3>任务列表</h3>
            <p>查看服务订单触发的任务与后台手动创建任务。</p>
          </div>
        </div>
        <TableShell
          columns={['任务 ID', '类型', '状态', '目标账号', '创建时间']}
          rows={tasks.map((task) => [
            task.id,
            task.type,
            <StatusPill key={`${task.id}-status`}>{task.status}</StatusPill>,
            task.targetAccount,
            new Date(task.createdAt).toLocaleString('zh-CN'),
          ])}
          emptyText="暂时没有任务记录。"
        />
      </Panel>
    </div>
  )
}
