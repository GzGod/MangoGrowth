'use client'

import { PrivyProvider } from '@privy-io/react-auth'

import { SessionProvider } from '@/components/providers/session-provider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    throw new Error('Missing NEXT_PUBLIC_PRIVY_APP_ID')
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#171717',
          logo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/logo.svg`,
        },
      }}
    >
      <SessionProvider>{children}</SessionProvider>
    </PrivyProvider>
  )
}
