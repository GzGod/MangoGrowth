import { describe, it, expect, vi } from 'vitest'
import { adjustBalanceReturning, decrementBalanceIfSufficient } from './balance'

// Minimal tx mock that captures $queryRaw calls
function makeTx(rows: unknown[]) {
  return { $queryRaw: vi.fn().mockResolvedValue(rows) }
}

describe('adjustBalanceReturning', () => {
  it('issues a single UPDATE...RETURNING and returns the new balance', async () => {
    const tx = makeTx([{ usdBalance: 6000 }])
    const result = await adjustBalanceReturning(tx as never, 'user_1', 1000)
    expect(result).toBe(6000)
    expect(tx.$queryRaw).toHaveBeenCalledOnce()
  })

  it('throws when no row is returned (user not found)', async () => {
    const tx = makeTx([])
    await expect(adjustBalanceReturning(tx as never, 'user_1', 1000)).rejects.toThrow('User not found')
  })

  it('does NOT issue a separate SELECT — only one DB call', async () => {
    const tx = makeTx([{ usdBalance: 500 }])
    await adjustBalanceReturning(tx as never, 'user_1', -500)
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1)
  })
})

describe('decrementBalanceIfSufficient', () => {
  it('returns the post-decrement balance when sufficient', async () => {
    const tx = makeTx([{ usdBalance: 100 }])
    const result = await decrementBalanceIfSufficient(tx as never, 'user_1', 900)
    expect(result).toBe(100)
    expect(tx.$queryRaw).toHaveBeenCalledOnce()
  })

  it('returns null when balance is insufficient (no row updated)', async () => {
    const tx = makeTx([])
    const result = await decrementBalanceIfSufficient(tx as never, 'user_1', 9999)
    expect(result).toBeNull()
  })

  it('does NOT issue a separate SELECT — only one DB call', async () => {
    const tx = makeTx([{ usdBalance: 0 }])
    await decrementBalanceIfSufficient(tx as never, 'user_1', 1000)
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1)
  })
})
