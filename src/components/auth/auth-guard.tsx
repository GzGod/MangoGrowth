'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useSession } from '@/components/providers/session-provider'

function GuardCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state panel">
      <div className="empty-state__copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export function AuthGuard({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode
  adminOnly?: boolean
}) {
  const router = useRouter()
  const { isReady, isAuthenticated, isSessionLoading, user } = useSession()

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isReady, router])

  if (!isReady || isSessionLoading) {
    return <GuardCard title="正在同步账户信息" description="Privy 登录状态已就绪后，我们会自动加载你的业务数据。" />
  }

  if (!isAuthenticated) {
    return <GuardCard title="需要先登录" description="当前页面依赖 Privy 登录态，请先完成登录。" />
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <GuardCard title="需要管理员权限" description="当前账号不是管理员，无法查看全局订单和用户数据。" />
  }

  return <>{children}</>
}
