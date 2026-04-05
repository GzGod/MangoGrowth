'use client'

import {
  BarChart3,
  CalendarDays,
  CreditCard,
  Layers3,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { useSession } from '@/components/providers/session-provider'

const navigation = [
  { href: '/dashboard', label: '仪表盘', icon: BarChart3 },
  { href: '/services', label: '服务', icon: Sparkles },
  { href: '/account-growth', label: '账户增长', icon: TrendingUp },
  { href: '/orders', label: '订单', icon: CalendarDays },
  { href: '/billing', label: '账单', icon: CreditCard },
  { href: '/plans', label: '套餐与订阅', icon: Layers3 },
]

const titleMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/services': '服务',
  '/account-growth': '账户增长',
  '/orders': '订单',
  '/billing': '账单',
  '/plans': '套餐与订阅',
  '/admin': '管理后台',
}

function Brand() {
  return (
    <div className="sidebar__brand">
      <div className="sidebar__brand-mark" aria-hidden="true">
        <Zap size={16} strokeWidth={2.2} />
      </div>
      <div className="sidebar__brand-copy">
        <div className="sidebar__brand-title">MangoGrowth</div>
        <div className="sidebar__brand-tagline">Powered by MangoGrowth</div>
      </div>
    </div>
  )
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {navigation.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href} className={`sidebar__link${isActive ? ' is-active' : ''}`} onClick={onNavigate}>
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        )
      })}
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout, user } = useSession()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pageTitle = titleMap[pathname] ?? '仪表盘'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />

        <nav className="sidebar__nav" aria-label="主导航">
          <NavItems />
          {user?.role === 'ADMIN' ? (
            <Link href="/admin" className={`sidebar__link${pathname === '/admin' ? ' is-active' : ''}`}>
              <Shield size={16} />
              <span>管理后台</span>
            </Link>
          ) : null}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__invite-card">
            <span className="sidebar__invite-icon">
              <Wallet size={14} />
            </span>
            <span>邀请赚积分</span>
          </div>

          <div className="sidebar__balance">
            <span className="sidebar__balance-label">积分余额</span>
            <div className="sidebar__balance-row">
              <strong>{user?.creditBalance.toLocaleString() ?? '0'}</strong>
              <Link href="/plans" className="sidebar__circle-button" aria-label="购买积分">
                +
              </Link>
            </div>
          </div>

          <div className="sidebar__meta">
            <div className="sidebar__meta-link">
              <Settings size={14} />
              <span>设置</span>
            </div>
            <div className="sidebar__account">
              <span className="sidebar__account-email">{user?.email ?? '未绑定邮箱'}</span>
              <button type="button" className="sidebar__logout" aria-label="退出登录" onClick={() => void logout()}>
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="app-shell__content">
        <div className="mobile-nav">
          <button type="button" className="mobile-nav__button" aria-label="打开导航菜单" onClick={() => setIsDrawerOpen(true)}>
            <Menu size={18} />
          </button>
          <div>
            <div className="page-header__eyebrow">MangoGrowth</div>
            <div className="page-header__mobile-title">{pageTitle}</div>
          </div>
        </div>

        <header className="page-header">
          <div className="page-header__eyebrow">控制台</div>
          <h1>{pageTitle}</h1>
        </header>

        <div className="app-shell__page">{children}</div>
      </main>

      {isDrawerOpen ? (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer__backdrop" onClick={() => setIsDrawerOpen(false)} />
          <aside className="mobile-drawer__panel">
            <Brand />
            <nav className="mobile-drawer__nav" aria-label="移动导航">
              <NavItems onNavigate={() => setIsDrawerOpen(false)} />
              {user?.role === 'ADMIN' ? (
                <Link href="/admin" className={`sidebar__link${pathname === '/admin' ? ' is-active' : ''}`} onClick={() => setIsDrawerOpen(false)}>
                  <Shield size={16} />
                  <span>管理后台</span>
                </Link>
              ) : null}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
