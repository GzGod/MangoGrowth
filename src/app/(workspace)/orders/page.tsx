'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Search } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { useApiQuery } from '@/hooks/use-api-query'
import { Panel, PrimaryButton, StatusPill } from '@/components/ui/surface'

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

const pageSizes = [20, 50, 100]

const statusLabels: Record<string, string> = {
  pending: '待处理',
  paid: '已支付',
  active: '进行中',
  running: '执行中',
  completed: '已完成',
  canceled: '已取消',
}

function resolveStatusLabel(status: string) {
  return statusLabels[status.toLowerCase()] ?? status
}

export default function OrdersPage() {
  const { data } = useApiQuery<OrdersResponse>('/api/orders')
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pageSize, setPageSize] = useState(20)

  const filteredOrders = useMemo(() => {
    return (data?.orders ?? []).filter((order) => {
      const haystack = `${order.id} ${order.plan.name}`.toLowerCase()
      const matchesKeyword = haystack.includes(keyword.trim().toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter

      return matchesKeyword && matchesStatus
    })
  }, [data?.orders, keyword, statusFilter])

  const totalCount = filteredOrders.length
  const pagedOrders = filteredOrders.slice(0, pageSize)

  return (
    <div className="page-stack page-stack--orders">
      <div className="orders-toolbar">
        <div className="orders-toolbar__left">
          <label className="search-field search-field--orders">
            <Search size={16} />
            <input
              placeholder="搜索订单 ID/订单名称/用户名"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </label>
        </div>

        <div className="orders-toolbar__right">
          <label className="orders-select">
            <span>订单状态</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">全部</option>
              <option value="pending">待处理</option>
              <option value="paid">已支付</option>
              <option value="active">进行中</option>
              <option value="running">执行中</option>
              <option value="completed">已完成</option>
              <option value="canceled">已取消</option>
            </select>
          </label>

          <Link href="/services">
            <PrimaryButton>创建服务</PrimaryButton>
          </Link>
        </div>
      </div>

      <Panel className="orders-table-panel">
        <div className="orders-table-shell">
          <table className="orders-table">
            <thead>
              <tr>
                <th>订单 ID</th>
                <th>订单名称</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>进度</th>
                <th>使用量 (PB)</th>
                <th>预计剩余时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.length > 0 ? (
                pagedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.plan.name}</td>
                    <td>
                      <StatusPill>{resolveStatusLabel(order.status)}</StatusPill>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString('zh-CN')}</td>
                    <td>{`${order.progress}% (${order.progress}/100)`}</td>
                    <td>{order.creditsCost.toLocaleString()}</td>
                    <td>0</td>
                    <td>
                      <button type="button" className="orders-table__icon-button" aria-label={`查看订单 ${order.id}`}>
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="orders-table__empty">
                    暂无订单记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="orders-table-footer">
          <p>{`显示 1 - ${Math.min(totalCount, pageSize)} 页，共 ${totalCount || 1} 条`}</p>

          <div className="orders-table-footer__right">
            <label className="orders-select orders-select--compact">
              <span>每页行数</span>
              <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div className="orders-pagination">
              <button type="button" aria-label="第一页" disabled>
                <ChevronsLeft size={14} />
              </button>
              <button type="button" aria-label="上一页" disabled>
                <ChevronLeft size={14} />
              </button>
              <button type="button" aria-label="下一页" disabled>
                <ChevronRight size={14} />
              </button>
              <button type="button" aria-label="最后一页" disabled>
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
