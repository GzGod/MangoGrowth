'use client'

import { useApiQuery } from '@/hooks/use-api-query'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Panel, StatusPill, TableShell } from '@/components/ui/surface'

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

function AdminScreen() {
  const { data: usersData } = useApiQuery<AdminUsersResponse>('/api/admin/users')
  const { data: ordersData } = useApiQuery<AdminOrdersResponse>('/api/admin/orders')
  const { data: rechargeData } = useApiQuery<AdminRechargeOrdersResponse>('/api/admin/recharge-orders')
  const { data: tasksData } = useApiQuery<AdminTasksResponse>('/api/admin/tasks')

  return (
    <div className="page-stack">
      <Panel className="notice-bar">
        <span className="notice-dot" />
        <p>管理员账号由 `BOOTSTRAP_ADMIN_EMAILS` 环境变量自动提升，首次登录即可查看全局数据。</p>
      </Panel>

      <Panel>
        <div className="panel-heading">
          <div>
            <h3>用户列表</h3>
            <p>管理员可以看到所有注册用户的邮箱、角色和当前积分。</p>
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
            <p>可以直接看到是谁下单了、买了什么、订单金额和当前状态。</p>
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
            <p>查看服务型订单触发的任务和手动创建的任务。</p>
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

export default function AdminPage() {
  return (
    <AuthGuard adminOnly>
      <AdminScreen />
    </AuthGuard>
  )
}
