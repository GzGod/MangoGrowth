import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AdminLoginPage from './page'

const replace = vi.fn()
const refresh = vi.fn()
const router = { replace, refresh }

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}))

describe('AdminLoginPage', () => {
  beforeEach(() => {
    replace.mockReset()
    refresh.mockReset()
    vi.restoreAllMocks()
  })

  it('submits admin credentials when the CTA is clicked', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ admin: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ admin: { id: 'admin_1' } }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ admin: null }),
      })

    vi.stubGlobal('fetch', fetchMock)

    render(<AdminLoginPage />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/auth/session', { cache: 'no-store' })
    })

    fireEvent.change(screen.getByPlaceholderText('请输入管理员账号'), {
      target: { value: 'root' },
    })
    fireEvent.change(screen.getByPlaceholderText('请输入管理员密码'), {
      target: { value: 'secret-123' },
    })

    fireEvent.click(screen.getByRole('button', { name: '进入管理员后台' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        '/api/admin/auth/login',
        expect.objectContaining({
          method: 'POST',
        }),
      )
    })
  })
})
