import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/auth/request'
import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'
import { adjustBalanceReturning } from '@/lib/db/balance'

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request)
    const body = (await request.json()) as {
      userId?: string
      amount?: number
      reason?: string
    }

    if (!body.userId || typeof body.amount !== 'number' || body.amount === 0) {
      return NextResponse.json({ error: 'userId and amount are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: body.userId } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const amount = body.amount

    const updatedUser = await db.$transaction(async (tx) => {
      // Atomic balance adjustment via UPDATE...RETURNING — returns the post-update
      // balance in one round-trip; no separate SELECT can race with it.
      const balanceAfter = await adjustBalanceReturning(tx, user.id, amount)

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'MANUAL_ADJUST',
          amount,
          balanceAfter,
          description: body.reason ?? '管理员调整余额',
          metadata: {
            actorAdminId: admin.id,
            actorAdminUsername: admin.username,
          },
        },
      })

      return tx.user.findUniqueOrThrow({ where: { id: user.id } })
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
