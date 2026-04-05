import { NextResponse } from 'next/server'

import { requireAdminSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeOrder } from '@/lib/server/serializers'

type Context = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: Context) {
  try {
    await requireAdminSessionUser(request)
    const { id } = await context.params
    const body = (await request.json()) as { status?: 'PENDING' | 'PAID' | 'ACTIVE' | 'COMPLETED' | 'CANCELED'; progress?: number }

    const order = await db.order.update({
      where: { id },
      data: {
        status: body.status,
        progress: body.progress,
        completedAt: body.status === 'COMPLETED' ? new Date() : undefined,
      },
      include: { plan: true, user: true },
    })

    return NextResponse.json({ order: serializeOrder(order) })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
