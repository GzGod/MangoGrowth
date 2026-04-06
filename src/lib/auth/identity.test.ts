import { describe, expect, it } from 'vitest'

import { extractPrivyIdentity, resolveDisplayIdentity } from './identity'

describe('extractPrivyIdentity', () => {
  it('reads email and wallet address from linked accounts', () => {
    const identity = extractPrivyIdentity({
      email: { address: 'owner@example.com' },
      linkedAccounts: [
        { type: 'wallet', address: '0x1234567890abcdef1234567890abcdef12345678' },
        { type: 'email', address: 'owner@example.com' },
      ],
    })

    expect(identity).toEqual({
      email: 'owner@example.com',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    })
  })
})

describe('resolveDisplayIdentity', () => {
  it('prefers the synced local user identity', () => {
    expect(
      resolveDisplayIdentity(
        {
          email: 'local@example.com',
          walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        },
        {
          email: 'privy@example.com',
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        },
        true,
      ),
    ).toEqual({
      label: 'local@example.com',
      title: 'local@example.com',
    })
  })

  it('falls back to the privy wallet when the local profile is not synced yet', () => {
    expect(
      resolveDisplayIdentity(
        null,
        {
          email: null,
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        },
        true,
      ),
    ).toEqual({
      label: '0x1234...5678',
      title: '0x1234567890abcdef1234567890abcdef12345678',
    })
  })

  it('returns a connected placeholder for authenticated users with no profile details', () => {
    expect(resolveDisplayIdentity(null, { email: null, walletAddress: null }, true)).toEqual({
      label: '账户已连接',
      title: '账户已连接',
    })
  })
})
