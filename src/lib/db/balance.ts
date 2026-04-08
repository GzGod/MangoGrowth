import { sqltag } from '@prisma/client/runtime/library'
import type { Prisma } from '@/generated/prisma/client'

/**
 * Atomically adjusts a user's usdBalance by `delta` (positive or negative)
 * and returns the exact post-update balance in a single round-trip.
 *
 * Uses `UPDATE ... RETURNING` so the returned value is the balance that THIS
 * update produced — not a subsequent SELECT that could see a concurrent write.
 * Safe under PostgreSQL READ COMMITTED.
 */
export async function adjustBalanceReturning(
  tx: Prisma.TransactionClient,
  userId: string,
  delta: number,
): Promise<number> {
  const rows = await tx.$queryRaw<[{ usdBalance: number }]>(
    sqltag`UPDATE "User" SET "usdBalance" = "usdBalance" + ${delta} WHERE id = ${userId} RETURNING "usdBalance"`,
  )
  const row = rows[0]
  if (!row) throw new Error('User not found')
  return row.usdBalance
}

/**
 * Atomically decrements usdBalance by `cost` only if balance >= cost.
 * Returns the post-update balance, or null if the condition was not met.
 */
export async function decrementBalanceIfSufficient(
  tx: Prisma.TransactionClient,
  userId: string,
  cost: number,
): Promise<number | null> {
  const rows = await tx.$queryRaw<[{ usdBalance: number }]>(
    sqltag`UPDATE "User" SET "usdBalance" = "usdBalance" - ${cost} WHERE id = ${userId} AND "usdBalance" >= ${cost} RETURNING "usdBalance"`,
  )
  return rows[0]?.usdBalance ?? null
}
