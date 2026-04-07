import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { getAdminPassword, getAdminSessionSecret, getAdminUsername } from '@/lib/env'

import {
  ADMIN_SESSION_TTL_SECONDS,
  hashAdminPassword,
  resolveBootstrapAdminCredentials,
  signAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from './core'

export const ADMIN_SESSION_COOKIE = 'mango_admin_session'

export type AdminSessionUser = {
  id: string
  username: string
  displayName: string | null
}

async function getCookieToken(request?: Request) {
  if (request) {
    const cookieHeader = request.headers.get('cookie') ?? ''
    const pairs = cookieHeader.split(';').map((part) => part.trim())
    const match = pairs.find((pair) => pair.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    return match ? decodeURIComponent(match.slice(`${ADMIN_SESSION_COOKIE}=`.length)) : null
  }

  return (await cookies()).get(ADMIN_SESSION_COOKIE)?.value ?? null
}

export async function ensureBootstrapAdminAccount() {
  const credentials = resolveBootstrapAdminCredentials({
    ADMIN_USERNAME: getAdminUsername(),
    ADMIN_PASSWORD: getAdminPassword(),
  })

  if (!credentials) {
    return null
  }

  const existing = await db.adminAccount.findUnique({
    where: { username: credentials.username },
  })

  if (existing) {
    return existing
  }

  return db.adminAccount.create({
    data: {
      username: credentials.username,
      passwordHash: await hashAdminPassword(credentials.password),
      displayName: '超级管理员',
      createdByName: 'bootstrap',
    },
  })
}

export async function authenticateAdmin(username: string, password: string) {
  await ensureBootstrapAdminAccount()

  const admin = await db.adminAccount.findUnique({
    where: { username: username.trim() },
  })

  if (!admin) {
    return null
  }

  const isValid = await verifyAdminPassword(password, admin.passwordHash)
  if (!isValid) {
    return null
  }

  return admin
}

export function createAdminSessionResponse(admin: { id: string; username: string; displayName?: string | null }) {
  const token = signAdminSessionToken(
    {
      adminId: admin.id,
      username: admin.username,
    },
    getAdminSessionSecret(),
  )

  const response = NextResponse.json({
    admin: {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName ?? null,
    },
  })

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  })

  return response
}

export function clearAdminSessionResponse() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function getAdminSession(request?: Request): Promise<AdminSessionUser | null> {
  await ensureBootstrapAdminAccount()

  const token = await getCookieToken(request)
  if (!token) {
    return null
  }

  const payload = verifyAdminSessionToken(token, getAdminSessionSecret())
  if (!payload) {
    return null
  }

  const admin = await db.adminAccount.findUnique({
    where: { id: payload.adminId },
    select: {
      id: true,
      username: true,
      displayName: true,
    },
  })

  if (!admin) {
    return null
  }

  return admin
}

export async function requireAdminSession(request: Request) {
  const admin = await getAdminSession(request)

  if (!admin) {
    throw new Response('Forbidden', { status: 403 })
  }

  return admin
}
