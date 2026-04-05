'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { useApiQuery } from '@/hooks/use-api-query'
import { Panel, PrimaryButton, StatusPill, TableShell } from '@/components/ui/surface'

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

  return (
    <div className="page-stack">
      <div className="toolbar">
        <label className="search-field">
          <Search size={16} />
          <input placeholder="搜索订单 ID / 订单名称" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </label>
        <div className="toolbar__actions">
          <PrimaryButton>创建服务</PrimaryButton>
        </div>
      </div>

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
          emptyText="暂无订单，去套餐页购买第一个方案吧。"
        />
      </Panel>
    </div>
  )
}
