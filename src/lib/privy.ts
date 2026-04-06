import { PrivyClient } from '@privy-io/server-auth'

import { getPrivyAppSecret, getPublicPrivyAppId } from '@/lib/env'

declare global {
  var __mangoPrivyClient__: PrivyClient | undefined
}

export function getPrivyClient() {
  if (global.__mangoPrivyClient__) {
    return global.__mangoPrivyClient__
  }

  const client = new PrivyClient(getPublicPrivyAppId(), getPrivyAppSecret())

  if (process.env.NODE_ENV !== 'production') {
    global.__mangoPrivyClient__ = client
  }

  return client
}
