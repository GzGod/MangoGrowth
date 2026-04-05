import UsageChartCard from '../components/charts/UsageChartCard'
import DataTable from '../components/ui/DataTable'
import EmptyStatePanel from '../components/ui/EmptyStatePanel'
import GuideCard from '../components/ui/GuideCard'
import MetricCard from '../components/ui/MetricCard'
import {
  dashboardUsageByRange,
  dashboardUsageRanges,
  onboardingCards,
  overviewMetrics,
  quotaEmptyState,
  recentOrders,
} from '../data/dashboard'

function DashboardPage() {
  return (
    <div className="page-stack">
      <section>
        <div className="section-title">新手引导</div>
        <div className="grid-two">
          {onboardingCards.map((card) => (
            <GuideCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">概览</div>
        <div className="grid-three">
          {overviewMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">套餐配额</div>
        <EmptyStatePanel {...quotaEmptyState} />
      </section>

      <UsageChartCard
        title="使用量"
        subtitle="(1,000 Credits)"
        ranges={dashboardUsageRanges}
        datasets={dashboardUsageByRange}
        testId="usage-chart-card"
      />

      <section className="panel" data-testid="recent-orders-card">
        <div className="panel-heading">
          <div>
            <h3>最近订单</h3>
            <p>您最近的增长任务订单（20 条记录）</p>
          </div>
        </div>

        <DataTable
          rows={recentOrders}
          columns={[
            { key: 'id', header: '订单 ID', cell: (row) => row.id },
            { key: 'status', header: '订单状态', cell: (row) => <span className="status-pill">{row.status}</span> },
            { key: 'name', header: '订单名称', cell: (row) => row.name },
            { key: 'createdAt', header: '创建时间', cell: (row) => row.createdAt },
            { key: 'progress', header: '进度', cell: (row) => row.progress },
            { key: 'credits', header: '使用量 (Credits)', cell: (row) => row.credits },
            { key: 'remainingTime', header: '预计剩余时间', cell: (row) => row.remainingTime },
          ]}
        />
      </section>
    </div>
  )
}

export default DashboardPage
