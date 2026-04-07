'use client'

import { ChevronDown, ChevronUp, ShieldCheck, ShieldPlus, Users } from 'lucide-react'
import { useState } from 'react'

import { useAdminApiQuery } from '@/hooks/use-admin-api-query'
import { Panel, PrimaryButton, SecondaryButton, StatusPill, TableShell } from '@/components/ui/surface'

type AdminUsersResponse = {
  users: Array<{
    id: string
    email: string | null
    role: string
    creditBalance: number
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
  creditsCost: number
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
    credits: number
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

const ORDER_STATUSES = ['PENDING', 'PAID', 'ACTIVE', 'COMPLETED', 'CANCELED'] as const

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
              <p><span>积分消耗</span><strong>{order.creditsCost.toLocaleString()}</strong></p>
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

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

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

  const ORDER_COLUMNS = ['订单 ID', '下单用户', '订单名称', '状态', '积分消耗', '金额', '创建时间', '']

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
          columns={['用户 ID', '邮箱', '角色', '积分', '注册时间']}
          rows={users.map((user) => [
            user.id,
            user.email ?? '未绑定邮箱',
            <StatusPill key={`${user.id}-role`}>{user.role}</StatusPill>,
            user.creditBalance.toLocaleString(),
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
                    <td>{order.creditsCost.toLocaleString()}</td>
                    <td>${order.amountUsd}</td>
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
            <h3>充值订单</h3>
            <p>查看充值金额、积分额度与支付状态。</p>
          </div>
        </div>
        <TableShell
          columns={['充值单 ID', '用户', '积分', '金额', '状态', '创建时间']}
          rows={rechargeOrders.map((order) => [
            order.id,
            order.user?.email ?? '未知用户',
            order.credits.toLocaleString(),
            `$${order.amountUsd}`,
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
