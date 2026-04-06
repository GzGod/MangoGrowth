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
        <StatCard label="订单总数" value={metrics.count.toLocaleString()} icon={FolderKanban} className="metric-card--spotlight" />
        <StatCard label="消耗积分" value={metrics.totalCredits.toLocaleString()} icon={WalletCards} className="metric-card--spotlight" />
        <StatCard label="订单金额" value={`$${metrics.totalAmount.toLocaleString()}`} icon={CircleDollarSign} className="metric-card--spotlight" />
      </div>

      <div className="toolbar toolbar--elevated">
        <label className="search-field search-field--spotlight">
          <Search size={16} />
          <input placeholder="搜索订单 ID / 套餐名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </label>
        <div className="toolbar__actions">
          <Link href="/services">
            <PrimaryButton className="primary-button--hero">创建服务</PrimaryButton>
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          eyebrow="订单中心"
          title="还没有任何订单哦～"
          description="先购买一个适合你的套餐，系统会自动为你创建订单，并同步到账单与管理后台。"
          action={
            <Link href="/plans">
              <PrimaryButton>立即购买套餐</PrimaryButton>
            </Link>
          }
        />
      ) : (
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
      )}
    </div>
  )
}
