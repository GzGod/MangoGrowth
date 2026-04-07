import { describe, expect, it } from 'vitest'

import {
  hashAdminPassword,
  resolveBootstrapAdminCredentials,
  signAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from './core'

describe('resolveBootstrapAdminCredentials', () => {
  it('prefers ADMIN_USERNAME and ADMIN_PASSWORD', () => {
    expect(
      resolveBootstrapAdminCredentials({
        ADMIN_USERNAME: 'root',
        ADMIN_PASSWORD: 'secret-123',
        BOOTSTRAP_ADMIN_USERNAME: 'fallback',
        BOOTSTRAP_ADMIN_PASSWORD: 'fallback-secret',
      }),
    ).toEqual({
      username: 'root',
      password: 'secret-123',
    })
  })

  it('falls back to BOOTSTRAP_ADMIN_* names', () => {
    expect(
      resolveBootstrapAdminCredentials({
        BOOTSTRAP_ADMIN_USERNAME: 'owner',
        BOOTSTRAP_ADMIN_PASSWORD: 'owner-secret',
      }),
    ).toEqual({
      username: 'owner',
      password: 'owner-secret',
    })
  })
})

describe('admin password hashing', () => {
  it('verifies the original password against the generated hash', async () => {
    const hash = await hashAdminPassword('mango-admin')

    await expect(verifyAdminPassword('mango-admin', hash)).resolves.toBe(true)
    await expect(verifyAdminPassword('wrong-password', hash)).resolves.toBe(false)
  })
})

describe('admin session token', () => {
  it('round-trips a signed admin session payload', () => {
    const token = signAdminSessionToken(
      {
        adminId: 'admin_123',
        username: 'root',
      },
      'top-secret',
    )

    expect(verifyAdminSessionToken(token, 'top-secret')).toMatchObject({
      adminId: 'admin_123',
      username: 'root',
    })
  })

  it('rejects tampered tokens', () => {
    const token = signAdminSessionToken(
      {
        adminId: 'admin_123',
        username: 'root',
      },
      'top-secret',
    )

    expect(verifyAdminSessionToken(`${token}x`, 'top-secret')).toBeNull()
  })
})
