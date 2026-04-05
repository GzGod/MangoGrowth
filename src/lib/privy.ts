import { PrivyClient } from '@privy-io/server-auth'

import { env } from '@/lib/env'

declare global {
  var __mangoPrivyClient__: PrivyClient | undefined
}

export const privyClient =
  global.__mangoPrivyClient__ ??
  new PrivyClient(env.NEXT_PUBLIC_PRIVY_APP_ID, env.PRIVY_APP_SECRET)

if (process.env.NODE_ENV !== 'production') {
  global.__mangoPrivyClient__ = privyClient
}
