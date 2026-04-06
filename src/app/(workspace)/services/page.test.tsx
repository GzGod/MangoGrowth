import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ServicesPage from './page'

vi.mock('@/components/providers/session-provider', () => ({
  useSession: () => ({
    identityToken: null,
  }),
}))

vi.mock('@/hooks/use-api-query', () => ({
  useApiQuery: () => ({
    data: {
      tasks: [],
    },
    refetch: vi.fn(),
  }),
}))

describe('ServicesPage', () => {
  it('renders selectable service cards and the unified empty state', () => {
    render(<ServicesPage />)

    expect(screen.getByText('选择互动任务类型')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '关注' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '点赞' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('@mango_growth')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('补充任务目标、语气或执行备注...')).toBeInTheDocument()
    expect(screen.getByText('还没有任何任务记录哦～')).toBeInTheDocument()
    expect(screen.getAllByText('立即创建任务').length).toBeGreaterThan(0)
  })
})
