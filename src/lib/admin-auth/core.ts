import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto'

type AdminEnvSource = Partial<Record<'ADMIN_USERNAME' | 'ADMIN_PASSWORD' | 'BOOTSTRAP_ADMIN_USERNAME' | 'BOOTSTRAP_ADMIN_PASSWORD', string>>

type AdminSessionPayload = {
  adminId: string
  username: string
  exp: number
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

export function resolveBootstrapAdminCredentials(source: AdminEnvSource) {
  const username = source.ADMIN_USERNAME?.trim() || source.BOOTSTRAP_ADMIN_USERNAME?.trim() || ''
  const password = source.ADMIN_PASSWORD?.trim() || source.BOOTSTRAP_ADMIN_PASSWORD?.trim() || ''

  if (!username || !password) {
    return null
  }

  return { username, password }
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export async function verifyAdminPassword(password: string, storedHash: string) {
  const [algorithm, salt, expected] = storedHash.split(':')
  if (algorithm !== 'scrypt' || !salt || !expected) {
    return false
  }

  const candidate = scryptSync(password, salt, 64)
  const target = Buffer.from(expected, 'hex')
  if (candidate.length !== target.length) {
    return false
  }

  return timingSafeEqual(candidate, target)
}

export function signAdminSessionToken(
  payload: { adminId: string; username: string },
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  const body: AdminSessionPayload = {
    ...payload,
    exp: nowSeconds + SESSION_TTL_SECONDS,
  }

  const encodedPayload = toBase64Url(JSON.stringify(body))
  const signature = createHmac('sha256', secret).update(encodedPayload).digest('base64url')

  return `${encodedPayload}.${signature}`
}

export function verifyAdminSessionToken(token: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = createHmac('sha256', secret).update(encodedPayload).digest('base64url')
  const actualBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8')

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminSessionPayload
    if (!payload.adminId || !payload.username || payload.exp <= nowSeconds) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export const ADMIN_SESSION_TTL_SECONDS = SESSION_TTL_SECONDS
