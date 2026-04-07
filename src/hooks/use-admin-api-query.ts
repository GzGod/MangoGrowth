'use client'

import { useEffect, useState } from 'react'

type QueryState<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAdminApiQuery<T>(path: string, enabled = true): QueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const load = async () => {
      if (!enabled) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(path, { cache: 'no-store' })
        const payload = (await response.json().catch(() => null)) as { error?: string } | null

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Request failed')
        }

        setData(payload as T)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Request failed')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [enabled, path, reloadKey])

  return {
    data,
    loading,
    error,
    refetch: async () => {
      setReloadKey((value) => value + 1)
    },
  }
}
