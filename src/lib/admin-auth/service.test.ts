import { beforeEach, describe, expect, it, vi } from 'vitest'

const findUnique = vi.fn()
const create = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    adminAccount: {
      findUnique,
      create,
    },
  },
}))

vi.mock('@/lib/env', () => ({
  getAdminPassword: () => 'secret-123',
  getAdminSessionSecret: () => 'top-secret',
  getAdminUsername: () => 'root',
}))

describe('getAdminSession', () => {
  beforeEach(() => {
    findUnique.mockReset()
    create.mockReset()
  })

  it('returns null without touching the database when no admin cookie is present', async () => {
    const { getAdminSession } = await import('./service')

    await expect(getAdminSession(new Request('https://example.com/admin'))).resolves.toBeNull()
    expect(findUnique).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })
})
