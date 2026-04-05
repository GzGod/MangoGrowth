import { CirclePlus, Copy, MoveRight } from 'lucide-react'
import UsageChartCard from '../components/charts/UsageChartCard'
import DataTable from '../components/ui/DataTable'
import EmptyStatePanel from '../components/ui/EmptyStatePanel'
import MetricCard from '../components/ui/MetricCard'
import {
  billingProfile,
  billingUsageByRange,
  paymentOrders,
  subscriptionEmptyState,
} from '../data/account'
import { dashboardUsageRanges } from '../data/dashboard'

function BillingPage() {
  return (
    <div className="page-stack">
      <div className="grid-three">
        <article className="panel profile-card" data-testid="billing-profile-card">
          <span className="profile-card__label">我的资料</span>
          <div className="profile-card__row">
            <div>
              <strong>{billingProfile.email}</strong>
              <p>{billingProfile.uid}</p>
            </div>
            <button type="button" className="icon-button" aria-label="复制用户 ID">
              <Copy size={16} />
            </button>
          </div>
        </article>

        <MetricCard label="我的积分" value="5,050" icon={CirclePlus} />
        <MetricCard label="花费积分总数" value="1,000" icon={MoveRight} />
      </div>

      <section>
        <div className="section-title">套餐配额</div>
        <EmptyStatePanel {...subscriptionEmptyState} />
      </section>

      <UsageChartCard
        title="使用量"
        subtitle="(1,000 Credits)"
        ranges={dashboardUsageRanges}
        datasets={billingUsageByRange}
        testId="billing-usage-card"
      />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>支付订单</h3>
            <p>显示最近 20 条支付记录</p>
          </div>
        </div>

        <DataTable
          rows={paymentOrders}
          columns={[
            { key: 'id', header: '订单 ID', cell: (row) => row.id },
            { key: 'type', header: '类型', cell: (row) => row.type },
            { key: 'packageName', header: '套餐', cell: (row) => row.packageName },
            { key: 'subscription', header: '订阅', cell: (row) => row.subscription },
            { key: 'amount', header: '金额', cell: (row) => row.amount },
          ]}
        />
      </section>
    </div>
  )
}

export default BillingPage
