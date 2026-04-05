import { describe, expect, it } from 'vitest'

import { isBootstrapAdmin, parseBootstrapAdminEmails } from './admin'

describe('parseBootstrapAdminEmails', () => {
  it('normalizes comma-separated email values', () => {
    expect(parseBootstrapAdminEmails(' Admin@Mango.dev, owner@example.com  ,')).toEqual([
      'admin@mango.dev',
      'owner@example.com',
    ])
  })
})

describe('isBootstrapAdmin', () => {
  it('matches emails case-insensitively', () => {
    expect(isBootstrapAdmin('Admin@Mango.dev', ['admin@mango.dev'])).toBe(true)
  })

  it('returns false when the email is not present', () => {
    expect(isBootstrapAdmin('user@example.com', ['admin@mango.dev'])).toBe(false)
  })
})
