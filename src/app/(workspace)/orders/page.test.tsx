import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import OrdersPage from './page'

vi.mock('@/hooks/use-api-query', () => ({
  useApiQuery: () => ({
    data: {
      orders: [],
    },
  }),
}))

describe('OrdersPage', () => {
  it('renders top metrics and the unified empty state', () => {
    render(<OrdersPage />)

    expect(screen.getByText('订单总数')).toBeInTheDocument()
    expect(screen.getByText('消耗积分')).toBeInTheDocument()
    expect(screen.getByText('订单金额')).toBeInTheDocument()
    expect(screen.getByText('还没有任何订单哦～')).toBeInTheDocument()
    expect(screen.getByText('立即购买套餐')).toBeInTheDocument()
  })
})
