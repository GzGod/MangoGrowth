'use client'

import { useEffect, useState } from 'react'

import { apiFetch } from '@/lib/client/api'
import { useSession } from '@/components/providers/session-provider'

type QueryState<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApiQuery<T>(path: string, enabled = true): QueryState<T> {
  const { identityToken, isAuthenticated, isSessionLoading } = useSession()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (isSessionLoading) {
      return
    }

    const load = async () => {
      if (!enabled || !identityToken || !isAuthenticated) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const nextData = await apiFetch<T>(path, identityToken)
        setData(nextData)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Request failed')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [enabled, identityToken, isAuthenticated, isSessionLoading, path, reloadKey])

  return {
    data,
    loading,
    error,
    refetch: async () => {
      setReloadKey((value) => value + 1)
    },
  }
}
