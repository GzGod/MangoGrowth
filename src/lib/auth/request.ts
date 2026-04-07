import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { getBootstrapAdminEmails } from '@/lib/env'
import { isBootstrapAdmin, parseBootstrapAdminEmails } from '@/lib/auth/admin'
import { extractPrivyEmail, extractPrivyWalletAddress } from '@/lib/auth/identity'
import { getPrivyClient } from '@/lib/privy'

type PrivyLinkedAccount = {
  type?: string
  address?: string
  email?: string
  subject?: string
}

type PrivyUserShape = {
  id: string
  email?: { address?: string | null } | null
  linkedAccounts?: PrivyLinkedAccount[]
  linked_accounts?: PrivyLinkedAccount[]
  customMetadata?: Record<string, unknown> | null
  custom_metadata?: Record<string, unknown> | null
}

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

function extractName(privyUser: PrivyUserShape) {
  const metadata = privyUser.customMetadata ?? privyUser.custom_metadata ?? {}
  const nameValue = metadata.name
  return typeof nameValue === 'string' && nameValue.trim().length > 0 ? nameValue.trim() : null
}

function extractAvatarUrl(privyUser: PrivyUserShape) {
  const metadata = privyUser.customMetadata ?? privyUser.custom_metadata ?? {}
  const avatarUrl = metadata.avatarUrl ?? metadata.avatar_url
  return typeof avatarUrl === 'string' && avatarUrl.trim().length > 0 ? avatarUrl.trim() : null
}

export async function requireSessionUser(request: Request): Promise<SessionUser> {
  const identityToken = extractIdentityToken(request)

  if (!identityToken) {
    throw new Response('Unauthorized', { status: 401 })
  }

  const privyUser = (await getPrivyClient().getUser({ idToken: identityToken })) as unknown as PrivyUserShape
  const email = extractPrivyEmail(privyUser)
  const walletAddress = extractPrivyWalletAddress(privyUser)
  const bootstrapAdminEmails = parseBootstrapAdminEmails(getBootstrapAdminEmails())
  const role: 'USER' | 'ADMIN' = isBootstrapAdmin(email, bootstrapAdminEmails) ? 'ADMIN' : 'USER'

  const user = await db.user.upsert({
    where: { privyUserId: privyUser.id },
    update: {
      email,
      name: extractName(privyUser),
      avatarUrl: extractAvatarUrl(privyUser),
      role,
    },
    create: {
      privyUserId: privyUser.id,
      email,
      name: extractName(privyUser),
      avatarUrl: extractAvatarUrl(privyUser),
      role,
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

  return {
    ...user,
    walletAddress,
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
