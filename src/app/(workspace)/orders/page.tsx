'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CircleDollarSign, FolderKanban, Search, WalletCards } from 'lucide-react'

import { useApiQuery } from '@/hooks/use-api-query'
import { EmptyState, Panel, PrimaryButton, StatCard, StatusPill, TableShell } from '@/components/ui/surface'

type OrdersResponse = {
  orders: Array<{
    id: string
    status: string
    amountUsd: number
    creditsCost: number
    progress: number
    createdAt: string
    plan: { name: string }
  }>
}

export default function OrdersPage() {
  const { data } = useApiQuery<OrdersResponse>('/api/orders')
  const [keyword, setKeyword] = useState('')

  const rows = useMemo(() => {
    return (data?.orders ?? []).filter((order) => {
      const haystack = `${order.id} ${order.plan.name}`.toLowerCase()
      return haystack.includes(keyword.toLowerCase())
    })
  }, [data?.orders, keyword])

  const metrics = useMemo(() => {
    const totalAmount = rows.reduce((sum, order) => sum + order.amountUsd, 0)
    const totalCredits = rows.reduce((sum, order) => sum + order.creditsCost, 0)

    return {
      count: rows.length,
      totalAmount,
      totalCredits,
    }
  }, [rows])

  return (
    <div className="page-stack page-stack--orders">
      <div className="grid-three page-metrics-grid">
        <StatCard label="订单总数" value={metrics.count.toLocaleString()} icon={FolderKanban} />
        <StatCard label="消耗积分" value={metrics.totalCredits.toLocaleString()} icon={WalletCards} />
        <StatCard label="订单金额" value={`$${metrics.totalAmount.toLocaleString()}`} icon={CircleDollarSign} />
      </div>

      <div className="toolbar">
        <label className="search-field">
          <Search size={16} />
          <input placeholder="搜索订单 ID / 订单名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </label>
        <div className="toolbar__actions">
          <Link href="/services">
            <PrimaryButton>创建服务</PrimaryButton>
          </Link>
        </div>
      </div>

      {rows.length > 0 ? (
        <Panel>
          <TableShell
            columns={['订单 ID', '订单名称', '状态', '创建时间', '进度', '使用量 (Credits)', '价格 (USD)']}
            rows={rows.map((order) => [
              order.id,
              order.plan.name,
              <StatusPill key={`${order.id}-status`}>{order.status}</StatusPill>,
              new Date(order.createdAt).toLocaleString('zh-CN'),
              `${order.progress}%`,
              order.creditsCost.toLocaleString(),
              `$${order.amountUsd}`,
            ])}
          />
        </Panel>
      ) : (
        <EmptyState
          title="还没有任何订单哦～"
          description="先去购买一个套餐或订阅，系统会自动为你生成订单记录并同步到账单中心。"
          action={
            <Link href="/plans">
              <PrimaryButton>立即购买套餐</PrimaryButton>
            </Link>
          }
          className="empty-state--table"
        />
      )}
    </div>
  )
}
