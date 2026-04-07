'use client'

import { ArrowRight, LockKeyhole, UserRound, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { PrimaryButton } from '@/components/ui/surface'

type AdminSessionResponse = {
  admin: {
    id: string
    username: string
    displayName: string | null
  } | null
}

async function fetchAdminSession() {
  const response = await fetch('/api/admin/auth/session', {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as AdminSessionResponse
  return payload.admin
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const check = async () => {
      const admin = await fetchAdminSession()
      if (admin) {
        router.replace('/admin')
      }
    }

    void check()
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(payload?.error ?? '登录失败')
      }

      router.replace('/admin')
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '登录失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-hero panel">
        <div className="login-hero__brand">
          <div className="sidebar__brand-mark" aria-hidden="true">
            <Zap size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="sidebar__brand-title">MangoGrowth</div>
            <div className="sidebar__brand-tagline">Admin Console</div>
          </div>
        </div>

        <div className="login-hero__copy">
          <span className="guide-card__step">独立管理员后台</span>
          <h1>使用环境变量初始化的管理员账号登录后台</h1>
          <p>这里与用户端 Privy 登录分离，只用于查看全局订单、用户与充值数据，并可新增管理员。</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>管理员账号</span>
            <div className="field__input-wrap">
              <UserRound size={16} />
              <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入管理员账号" />
            </div>
          </label>

          <label className="field">
            <span>管理员密码</span>
            <div className="field__input-wrap">
              <LockKeyhole size={16} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入管理员密码"
              />
            </div>
          </label>

          {error ? <p className="field-error">{error}</p> : null}

          <PrimaryButton type="submit" className="admin-login-form__submit" disabled={isSubmitting}>
            {isSubmitting ? '登录中...' : '进入管理员后台'}
            <ArrowRight size={16} />
          </PrimaryButton>
        </form>
      </section>
    </main>
  )
}
