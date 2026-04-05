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

export const env = {
  NEXT_PUBLIC_PRIVY_APP_ID: requireEnv('NEXT_PUBLIC_PRIVY_APP_ID', process.env.NEXT_PUBLIC_PRIVY_APP_ID),
  PRIVY_APP_SECRET: requireEnv('PRIVY_APP_SECRET', process.env.PRIVY_APP_SECRET),
  DATABASE_URL: requireEnv('DATABASE_URL', process.env.DATABASE_URL),
  BOOTSTRAP_ADMIN_EMAILS: process.env.BOOTSTRAP_ADMIN_EMAILS ?? '',
  NEXT_PUBLIC_APP_URL: requireUrlEnv('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'),
}
