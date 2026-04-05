import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { isBootstrapAdmin, parseBootstrapAdminEmails } from '@/lib/auth/admin'
import { privyClient } from '@/lib/privy'

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
  name: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  creditBalance: number
}

const bootstrapAdminEmails = parseBootstrapAdminEmails(env.BOOTSTRAP_ADMIN_EMAILS)

function extractIdentityToken(request: Request) {
  const authorization = request.headers.get('authorization')
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim()
  }

  return request.headers.get('x-privy-token')
}

function extractEmail(privyUser: PrivyUserShape) {
  if (privyUser.email?.address) {
    return privyUser.email.address.toLowerCase()
  }

  const linkedAccounts = privyUser.linkedAccounts ?? privyUser.linked_accounts ?? []
  const emailAccount = linkedAccounts.find((account) => account.type === 'email')
  return emailAccount?.address?.toLowerCase() ?? emailAccount?.email?.toLowerCase() ?? null
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

  const privyUser = (await privyClient.getUser({ idToken: identityToken })) as unknown as PrivyUserShape
  const email = extractEmail(privyUser)
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
      creditBalance: true,
    },
  })

  return user
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
