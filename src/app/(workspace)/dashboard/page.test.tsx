import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import DashboardPage from './page'

vi.mock('@/hooks/use-api-query', () => ({
  useApiQuery: () => ({
    data: {
      metrics: {
        balance: 0,
        orderCount: 0,
        spentCredits: 0,
      },
      usage: {
        last7: [],
        last30: [],
        last90: [],
      },
      orders: [],
      subscriptions: [],
    },
    loading: false,
  }),
}))

vi.mock('@/components/charts/usage-chart', () => ({
  UsageChart: () => <div data-testid="usage-chart" />,
}))

describe('DashboardPage', () => {
  it('renders the redesigned onboarding and empty recent orders state', () => {
    render(<DashboardPage />)

    expect(screen.getByText('新手引导')).toBeInTheDocument()
    expect(screen.getByText('2 步完成')).toBeInTheDocument()
    expect(screen.getByText('完成度 50%')).toBeInTheDocument()
    expect(screen.getByText('完成度 100%')).toBeInTheDocument()
    expect(screen.getByText('还没有任何订单哦～')).toBeInTheDocument()
    expect(screen.getAllByText('立即购买套餐').length).toBeGreaterThan(0)
    expect(screen.getByTestId('usage-chart')).toBeInTheDocument()
  })
})
