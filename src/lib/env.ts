function requireEnv(name: string, value: string | undefined) {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function requireUrlEnv(name: string, value: string | undefined, fallback?: string) {
  const resolved = value?.trim() || fallback

  if (!resolved) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  try {
    new URL(resolved)
    return resolved
  } catch {
    throw new Error(`Invalid URL environment variable: ${name}`)
  }
}

export function getPublicPrivyAppId() {
  return requireEnv('NEXT_PUBLIC_PRIVY_APP_ID', process.env.NEXT_PUBLIC_PRIVY_APP_ID)
}

export function getPrivyAppSecret() {
  return requireEnv('PRIVY_APP_SECRET', process.env.PRIVY_APP_SECRET)
}

export function getDatabaseUrl() {
  return requireEnv('DATABASE_URL', process.env.DATABASE_URL)
}

export function getBootstrapAdminEmails() {
  return process.env.BOOTSTRAP_ADMIN_EMAILS ?? ''
}

export function getPublicAppUrl() {
  return requireUrlEnv('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000')
}

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME?.trim() || process.env.BOOTSTRAP_ADMIN_USERNAME?.trim() || ''
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim() || ''
}

export function getAdminSessionSecret() {
  return requireEnv('ADMIN_SESSION_SECRET', process.env.ADMIN_SESSION_SECRET)
}
