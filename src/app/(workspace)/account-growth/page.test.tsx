import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import AccountGrowthPage from './page'

vi.mock('@/hooks/use-api-query', () => ({
  useApiQuery: () => ({
    data: {
      subscriptions: [],
    },
  }),
}))

describe('AccountGrowthPage', () => {
  it('renders the redesigned growth plans and subscription preview state', () => {
    render(<AccountGrowthPage />)

    expect(screen.getByText('增长计划')).toBeInTheDocument()
    expect(screen.getByText('真实账号')).toBeInTheDocument()
    expect(screen.getByText('自动互动')).toBeInTheDocument()
    expect(screen.getByText('矩阵增长')).toBeInTheDocument()
    expect(screen.getAllByText('推荐').length).toBeGreaterThan(0)
    expect(screen.getByText('计划预览')).toBeInTheDocument()
    expect(screen.getByText('还没有开启增长计划')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '立即订阅' })).toBeInTheDocument()
  })
})
