import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ServicesPage from './page'

vi.mock('@/hooks/use-api-query', () => ({
  useApiQuery: () => ({
    data: {
      tasks: [],
    },
    refetch: vi.fn(),
  }),
}))

vi.mock('@/components/providers/session-provider', () => ({
  useSession: () => ({
    identityToken: 'token',
    user: {
      creditBalance: 5050,
    },
  }),
}))

vi.mock('@/lib/client/api', () => ({
  apiFetch: vi.fn(),
}))

describe('ServicesPage', () => {
  it('adds matching task panels when service cards are selected', () => {
    render(<ServicesPage />)

    fireEvent.click(screen.getByRole('button', { name: /关注/i }))
    expect(screen.getByText('关注数量')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('@username')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /点赞/i }))
    expect(screen.getByText('点赞数量')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('https://x.com/username/status/1234567890')).toHaveLength(1)
  })
})
