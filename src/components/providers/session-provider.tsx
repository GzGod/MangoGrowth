'use client'

import { useIdentityToken, usePrivy } from '@privy-io/react-auth'
import { createContext, useContext, useEffect, useState } from 'react'

import { apiFetch } from '@/lib/client/api'
import { extractPrivyIdentity } from '@/lib/auth/identity'

type LocalUser = {
  id: string
  privyUserId: string
  email: string | null
  walletAddress: string | null
  name: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
  usdBalance: number
}

type SessionContextValue = {
  identityToken: string | null
  isReady: boolean
  isAuthenticated: boolean
  isSessionLoading: boolean
  user: LocalUser | null
  authIdentity: {
    email: string | null
    walletAddress: string | null
  }
  login: () => void
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login, logout, user: privyUser } = usePrivy()
  const { identityToken } = useIdentityToken()
  const [user, setUser] = useState<LocalUser | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const authIdentity = extractPrivyIdentity(privyUser)

  const refreshSession = async () => {
    if (!ready) {
      return
    }

    if (!authenticated || !identityToken) {
      setUser(null)
      setIsSessionLoading(false)
      return
    }

    setIsSessionLoading(true)

    try {
      await apiFetch<{ user: LocalUser }>('/api/auth/sync', identityToken, {
        method: 'POST',
      })

      const session = await apiFetch<{ user: LocalUser }>('/api/auth/me', identityToken)
      setUser(session.user)
    } catch {
      setUser(null)
    } finally {
      setIsSessionLoading(false)
    }
  }

  useEffect(() => {
    const sync = async () => {
      if (!ready) {
        return
      }

      if (!authenticated || !identityToken) {
        setUser(null)
        setIsSessionLoading(false)
        return
      }

      setIsSessionLoading(true)

      try {
        await apiFetch<{ user: LocalUser }>('/api/auth/sync', identityToken, {
          method: 'POST',
        })

        const session = await apiFetch<{ user: LocalUser }>('/api/auth/me', identityToken)
        setUser(session.user)
      } catch {
        setUser(null)
      } finally {
        setIsSessionLoading(false)
      }
    }

    void sync()
  }, [authenticated, identityToken, ready])

  const value: SessionContextValue = {
    identityToken,
    isReady: ready,
    isAuthenticated: authenticated,
    isSessionLoading,
    user,
    authIdentity,
    login,
    logout,
    refreshSession,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider')
  }

  return context
}
