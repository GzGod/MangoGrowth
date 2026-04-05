'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useSession } from '@/components/providers/session-provider'

export default function HomePage() {
  const router = useRouter()
  const { isReady, isAuthenticated } = useSession()

  useEffect(() => {
    if (!isReady) {
      return
    }

    router.replace(isAuthenticated ? '/dashboard' : '/login')
  }, [isAuthenticated, isReady, router])

  return null
}
