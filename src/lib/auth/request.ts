import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { getBootstrapAdminEmails } from '@/lib/env'
import { isBootstrapAdmin, parseBootstrapAdminEmails } from '@/lib/auth/admin'
import { getPrivyClient } from '@/lib/privy'

export type SessionUser = {
  id: string
  privyUserId: string
  email: string | null
  walletAddress: string | null
  name: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  usdBalance: number
}

function extractIdentityToken(request: Request) {
  const authorization = request.headers.get('authorization')
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim()
  }

  return request.headers.get('x-privy-token')
}


export async function requireSessionUser(request: Request): Promise<SessionUser> {
  const identityToken = extractIdentityToken(request)

  if (!identityToken) {
    throw new Response('Unauthorized', { status: 401 })
  }

  const claims = await getPrivyClient().verifyAuthToken(identityToken)
  const privyUserId = claims.userId

  const bootstrapAdminEmails = parseBootstrapAdminEmails(getBootstrapAdminEmails())

  const user = await db.user.upsert({
    where: { privyUserId },
    update: {},
    create: {
      privyUserId,
      email: null,
      name: null,
      avatarUrl: null,
      role: 'USER',
    },
    select: {
      id: true,
      privyUserId: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      usdBalance: true,
    },
  })

  const role: 'USER' | 'ADMIN' = isBootstrapAdmin(user.email, bootstrapAdminEmails) ? 'ADMIN' : 'USER'
  if (role !== user.role) {
    await db.user.update({ where: { id: user.id }, data: { role } })
  }

  return {
    ...user,
    role,
    walletAddress: null,
  }
}

export async function requireAdminSessionUser(request: Request) {
  const user = await requireSessionUser(request)

  if (user.role !== 'ADMIN') {
    throw new Response('Forbidden', { status: 403 })
  }

  return user
}

export function routeErrorResponse(error: unknown) {
  if (error instanceof Response) {
    return error
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error'
  return NextResponse.json({ error: message }, { status: 500 })
}
