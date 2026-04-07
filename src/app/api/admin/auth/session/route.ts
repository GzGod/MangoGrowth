import { NextResponse } from 'next/server'

import { routeErrorResponse } from '@/lib/auth/request'
import { getAdminSession } from '@/lib/admin-auth/service'

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession(request)
    return NextResponse.json({ admin })
  } catch (error) {
    return routeErrorResponse(error)
  }
}
