'use client'

import { ArrowRight, ShieldCheck, Wallet, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { PrimaryButton } from '@/components/ui/surface'
import { useSession } from '@/components/providers/session-provider'

export default function LoginPage() {
  const router = useRouter()
  const { isReady, isAuthenticated, isSessionLoading, login } = useSession()

  useEffect(() => {
    if (isReady && isAuthenticated && !isSessionLoading) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isReady, isSessionLoading, router])

  return (
    <main className="login-shell">
      <section className="login-hero panel">
        <div className="login-hero__brand">
          <div className="sidebar__brand-mark" aria-hidden="true">
            <Zap size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="sidebar__brand-title">MangoGrowth</div>
            <div className="sidebar__brand-tagline">现代增长控制台</div>
          </div>
        </div>

        <div className="login-hero__copy">
          <span className="guide-card__step">FULL-STACK CONSOLE</span>
          <h1>一个项目里打通登录、充值、下单和管理员视图</h1>
          <p>
            这套控制台已经切换到 Next.js 全栈架构，前端保持高保真 SaaS 后台体验，认证接入
            Privy，数据层预留了支付、任务流转和管理员订单视图。
          </p>
        </div>

        <div className="login-hero__list">
          <div className="info-card panel">
            <div className="info-card__icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3>Privy 登录</h3>
              <p>注册和登录统一走 Privy，业务库只维护本地角色、积分、订单和订阅。</p>
            </div>
          </div>

          <div className="info-card panel">
            <div className="info-card__icon">
              <Wallet size={18} />
            </div>
            <div>
              <h3>充值与购买</h3>
              <p>先创建充值订单，再模拟支付到账；订阅和服务套餐会消耗积分并记录订单。</p>
            </div>
          </div>
        </div>

        <div className="login-hero__actions">
          <PrimaryButton onClick={() => login()}>
            使用 Privy 登录
            <ArrowRight size={16} />
          </PrimaryButton>
        </div>
      </section>
    </main>
  )
}
