import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import DataTable from '../components/ui/DataTable'
import { orderStatusOptions, orders } from '../data/orders'

function OrdersPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('全部')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery =
        query.trim().length === 0 ||
        [order.id, order.name].some((value) =>
          value.toLowerCase().includes(query.trim().toLowerCase()),
        )

      const matchesStatus = status === '全部' || order.status === status
      return matchesQuery && matchesStatus
    })
  }, [query, status])

  return (
    <div className="page-stack">
      <section className="toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索订单 ID/订单名称/用户名名称"
          />
        </label>

        <div className="toolbar__actions">
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="订单状态">
            {orderStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button type="button" className="secondary-button">
            创建服务
          </button>
        </div>
      </section>

      <section className="panel">
        <DataTable
          rows={filteredOrders}
          columns={[
            { key: 'id', header: '订单 ID', cell: (row) => row.id },
            { key: 'name', header: '订单名称', cell: (row) => row.name },
            { key: 'status', header: '状态', cell: (row) => <span className="status-pill">{row.status}</span> },
            { key: 'createdAt', header: '创建时间', cell: (row) => row.createdAt },
            { key: 'progress', header: '进度', cell: (row) => row.progress },
            { key: 'credits', header: '使用量 (PB)', cell: (row) => row.credits },
            { key: 'remainingTime', header: '预计剩余时间', cell: (row) => row.remainingTime },
            { key: 'operation', header: '操作', cell: () => '查看' },
          ]}
        />

        <div className="table-footer">
          <span>显示 1 - {filteredOrders.length} 页，共 {filteredOrders.length} 条</span>
          <div className="table-footer__pagination">
            <span>每页行数 20</span>
            <button type="button">{'<'}</button>
            <button type="button">{'>'}</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default OrdersPage
