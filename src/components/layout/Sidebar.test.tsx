import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AppShell } from './Sidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

vi.mock('@/components/providers/session-provider', () => ({
  useSession: () => ({
    logout: vi.fn(),
    user: {
      role: 'USER',
      creditBalance: 12800,
    },
    authIdentity: {
      email: 'demo@mangogrowth.local',
      walletAddress: null,
    },
    isAuthenticated: true,
  }),
}))

describe('AppShell sidebar', () => {
  it('renders the full MangoGrowth brand and compact rewards modules', () => {
    render(
      <AppShell>
        <div>页面内容</div>
      </AppShell>,
    )

    const navigation = screen.getByLabelText('主导航')
    const sidebar = navigation.closest('.sidebar')

    expect(sidebar).not.toBeNull()

    const scoped = within(sidebar as HTMLElement)

    expect(scoped.getByText('MangoGrowth')).toBeInTheDocument()
    expect(scoped.getByText('现代增长控制台')).toBeInTheDocument()
    expect(scoped.getByText('邀请赚积分')).toBeInTheDocument()
    expect(scoped.getByText('积分余额')).toBeInTheDocument()
    expect(scoped.getByText('12,800')).toBeInTheDocument()
  })
})
