import { NextResponse } from 'next/server'
import { z } from 'zod'

import { routeErrorResponse } from '@/lib/auth/request'
import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'
import { serializeOrder } from '@/lib/server/serializers'

const patchOrderSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'ACTIVE', 'COMPLETED', 'CANCELED']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
})

type Context = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: Context) {
  try {
    await requireAdminSession(request)
    const { id } = await context.params
    const parsed = patchOrderSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const { status, progress } = parsed.data

    const order = await db.order.update({
      where: { id },
      data: {
        status,
        progress,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
      include: { plan: true, user: true },
    })

    return NextResponse.json({ order: serializeOrder(order) })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
