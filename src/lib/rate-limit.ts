// Per-user in-memory rate limiter for authenticated API routes.
// Keyed by user.id so one user cannot affect another's quota.
// Suitable for single-instance deployment; use Redis for multi-instance.

type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

export function checkUserRateLimit(
  userId: string,
  path: string,
  limit: number,
  windowMs = 60_000,
): boolean {
  const key = `${userId}:${path}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return false // not limited
  }

  if (entry.count >= limit) return true // limited

  entry.count++
  return false
}
