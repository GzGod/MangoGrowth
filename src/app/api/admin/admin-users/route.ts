import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/auth/request'
import { hashAdminPassword } from '@/lib/admin-auth/core'
import { requireAdminSession } from '@/lib/admin-auth/service'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await requireAdminSession(request)

    const admins = await db.adminAccount.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdByName: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      admins: admins.map((admin) => ({
        ...admin,
        createdAt: admin.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdminSession(request)
    const body = (await request.json()) as {
      username?: string
      password?: string
      displayName?: string
    }

    const username = body.username?.trim() ?? ''
    const password = body.password?.trim() ?? ''
    const displayName = body.displayName?.trim() || null

    if (!username || !password) {
      return NextResponse.json({ error: '请输入新管理员的账号和密码。' }, { status: 400 })
    }

    const existing = await db.adminAccount.findUnique({
      where: { username },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json({ error: '该管理员账号已存在。' }, { status: 409 })
    }

    const admin = await db.adminAccount.create({
      data: {
        username,
        passwordHash: await hashAdminPassword(password),
        displayName,
        createdById: actor.id,
        createdByName: actor.username,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdByName: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      admin: {
        ...admin,
        createdAt: admin.createdAt.toISOString(),
      },
    })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
