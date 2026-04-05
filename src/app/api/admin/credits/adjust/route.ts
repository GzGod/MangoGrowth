import { NextResponse } from 'next/server'

import { requireAdminSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSessionUser(request)
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
    const nextBalance = user.creditBalance + amount

    const [, updatedUser] = await db.$transaction([
      db.creditTransaction.create({
        data: {
          userId: user.id,
          type: 'MANUAL_ADJUST',
          amount,
          balanceAfter: nextBalance,
          description: body.reason ?? '管理员调整积分',
          metadata: { actorUserId: admin.id },
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: { creditBalance: nextBalance },
      }),
    ])

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
