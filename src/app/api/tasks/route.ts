import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeTask } from '@/lib/server/serializers'

const taskSchema = z.object({
  type: z.enum(['FOLLOW', 'LIKE', 'REPOST', 'COMMENT', 'BOOKMARK', 'QUOTE']),
  targetAccount: z.string().min(1).max(100),
  targetPostUrl: z.string().url().max(500).optional(),
  orderId: z.string().min(1),
  note: z.string().max(500).optional(),
})

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request)
    const tasks = await db.serviceTask.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tasks: tasks.map(serializeTask) })
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser(request)
    const parsed = taskSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    const { type, targetAccount, targetPostUrl, orderId, note } = parsed.data

    // Verify the order belongs to this user and is in a valid state
    const order = await db.order.findFirst({
      where: { id: orderId, userId: user.id },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status !== 'ACTIVE' && order.status !== 'PAID') {
      return NextResponse.json({ error: 'Order is not active' }, { status: 400 })
    }

    const task = await db.serviceTask.create({
      data: {
        userId: user.id,
        orderId,
        type,
        status: 'QUEUED',
        targetAccount,
        targetPostUrl,
        note,
      },
    })

    return NextResponse.json({ task: serializeTask(task) }, { status: 201 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
