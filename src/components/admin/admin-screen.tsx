'use client'

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

type AdminOrdersResponse = {
  orders: Array<{
    id: string
    status: string
    amountUsd: number
    creditsCost: number
    createdAt: string
    plan: { name: string }
    user: { email: string | null } | null
  }>
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
  const { data: ordersData } = useAdminApiQuery<AdminOrdersResponse>('/api/admin/orders', true)
  const { data: rechargeData } = useAdminApiQuery<AdminRechargeOrdersResponse>('/api/admin/recharge-orders', true)
  const { data: tasksData } = useAdminApiQuery<AdminTasksResponse>('/api/admin/tasks', true)
  const { data: adminAccountsData, refetch: refetchAdminAccounts } = useAdminApiQuery<AdminAccountsResponse>('/api/admin/admin-users', true)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateAdmin = async () => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      await adminFetch('/api/admin/admin-users', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          displayName,
        }),
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

  return (
    <div className="page-stack">
      <Panel className="notice-bar">
        <span className="notice-dot" />
        <p>当前使用独立管理员后台，与你的 Privy 用户端登录完全分离。当前管理员：{admin.displayName ?? admin.username}</p>
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>管理员账户</h3>
            <p>使用环境变量初始化首个管理员后，你可以在这里继续添加新的后台管理员。</p>
          </div>
          <SecondaryButton onClick={() => void handleLogout()}>退出管理员后台</SecondaryButton>
        </div>

        <div className="admin-create-grid">
          <label className="field">
            <span>管理员账号</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="例如 admin-root" />
          </label>
          <label className="field">
            <span>管理员密码</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="请输入新管理员密码" />
          </label>
          <label className="field">
            <span>显示名称</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="例如 运营主管" />
          </label>
        </div>

        {formError ? <p className="field-error">{formError}</p> : null}

        <div className="panel-actions">
          <PrimaryButton onClick={() => void handleCreateAdmin()} disabled={isSubmitting}>
            {isSubmitting ? '创建中...' : '添加新管理员'}
          </PrimaryButton>
        </div>

        <TableShell
          columns={['管理员账号', '显示名称', '创建人', '创建时间']}
          rows={(adminAccountsData?.admins ?? []).map((account) => [
            account.username,
            account.displayName ?? '-',
            account.createdByName ?? 'bootstrap',
            new Date(account.createdAt).toLocaleString('zh-CN'),
          ])}
        />
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>用户列表</h3>
            <p>查看所有注册用户的邮箱、角色和积分余额。</p>
          </div>
        </div>
        <TableShell
          columns={['用户 ID', '邮箱', '角色', '积分', '注册时间']}
          rows={(usersData?.users ?? []).map((user) => [
            user.id,
            user.email ?? '未绑定邮箱',
            <StatusPill key={`${user.id}-role`}>{user.role}</StatusPill>,
            user.creditBalance.toLocaleString(),
            new Date(user.createdAt).toLocaleString('zh-CN'),
          ])}
        />
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>购买订单</h3>
            <p>查看是谁下单、买了什么、金额多少以及当前状态。</p>
          </div>
        </div>
        <TableShell
          columns={['订单 ID', '下单用户', '订单名称', '状态', '积分消耗', '金额', '创建时间']}
          rows={(ordersData?.orders ?? []).map((order) => [
            order.id,
            order.user?.email ?? '未知用户',
            order.plan.name,
            <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
            order.creditsCost.toLocaleString(),
            `$${order.amountUsd}`,
            new Date(order.createdAt).toLocaleString('zh-CN'),
          ])}
        />
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>充值订单</h3>
            <p>查看充值金额、积分额度和支付状态。</p>
          </div>
        </div>
        <TableShell
          columns={['充值单 ID', '用户', '积分', '金额', '状态', '创建时间']}
          rows={(rechargeData?.rechargeOrders ?? []).map((order) => [
            order.id,
            order.user?.email ?? '未知用户',
            order.credits.toLocaleString(),
            `$${order.amountUsd}`,
            <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
            new Date(order.createdAt).toLocaleString('zh-CN'),
          ])}
        />
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>任务列表</h3>
            <p>查看服务订单触发的任务和手动创建任务。</p>
          </div>
        </div>
        <TableShell
          columns={['任务 ID', '类型', '状态', '目标账号', '创建时间']}
          rows={(tasksData?.tasks ?? []).map((task) => [
            task.id,
            task.type,
            <StatusPill key={`${task.id}-status`}>{task.status}</StatusPill>,
            task.targetAccount,
            new Date(task.createdAt).toLocaleString('zh-CN'),
          ])}
        />
      </Panel>
    </div>
  )
}
