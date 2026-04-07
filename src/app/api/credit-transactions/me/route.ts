import { NextResponse } from 'next/server'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeTransaction } from '@/lib/server/serializers'

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request)
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      transactions: transactions.map(serializeTransaction),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
