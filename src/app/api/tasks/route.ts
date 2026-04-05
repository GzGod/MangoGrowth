import { NextResponse } from 'next/server'

import { requireSessionUser, routeErrorResponse } from '@/lib/auth/request'
import { db } from '@/lib/db'
import { serializeTask } from '@/lib/server/serializers'

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
    const body = (await request.json()) as {
      type?: 'FOLLOW' | 'LIKE' | 'REPOST' | 'COMMENT' | 'BOOKMARK' | 'QUOTE'
      orderId?: string
      targetAccount?: string
      targetPostUrl?: string
      note?: string
    }

    if (!body.type || !body.targetAccount) {
      return NextResponse.json({ error: 'Task type and target account are required' }, { status: 400 })
    }

    const task = await db.serviceTask.create({
      data: {
        userId: user.id,
        orderId: body.orderId,
        type: body.type,
        status: 'QUEUED',
        targetAccount: body.targetAccount,
        targetPostUrl: body.targetPostUrl,
        note: body.note,
      },
    })

    return NextResponse.json({ task: serializeTask(task) }, { status: 201 })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
