import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/auth/request'
import { authenticateAdmin, createAdminSessionResponse } from '@/lib/admin-auth/service'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string
      password?: string
    }

    const username = body.username?.trim() ?? ''
    const password = body.password?.trim() ?? ''

    if (!username || !password) {
      return NextResponse.json({ error: '请输入管理员账号和密码。' }, { status: 400 })
    }

    const admin = await authenticateAdmin(username, password)
    if (!admin) {
      return NextResponse.json({ error: '管理员账号或密码不正确。' }, { status: 401 })
    }

    return createAdminSessionResponse(admin)
  } catch (error) {
    return routeErrorResponse(error)
  }
}
