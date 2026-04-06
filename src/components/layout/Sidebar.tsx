'use client'

import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Globe2,
  Layers3,
  LogOut,
  Menu,
  Moon,
  Palette,
  Settings,
  Shield,
  Sparkles,
  SunMedium,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useSession } from '@/components/providers/session-provider'
import { resolveDisplayIdentity } from '@/lib/auth/identity'

const navigation = [
  { href: '/dashboard', label: '仪表盘', icon: BarChart3 },
  { href: '/services', label: '服务', icon: Sparkles },
  { href: '/account-growth', label: '账户增长', icon: TrendingUp },
  { href: '/orders', label: '订单', icon: CalendarDays },
  { href: '/billing', label: '账单', icon: CreditCard },
  { href: '/plans', label: '套餐 & 订阅', icon: Layers3 },
]

const titleMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/services': '服务',
  '/account-growth': '账户增长',
  '/orders': '订单',
  '/billing': '账单',
  '/plans': '套餐 & 订阅',
  '/admin': '管理后台',
}

type ThemeMode = 'light' | 'dark'
type LanguageMode = 'zh-CN' | 'en'
type SettingsPanel = 'root' | 'language' | 'theme'

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
  const { logout, user, authIdentity, isAuthenticated } = useSession()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>('root')
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const storedTheme = window.localStorage.getItem('mango-theme')
    return storedTheme === 'dark' ? 'dark' : 'light'
  })
  const [language, setLanguage] = useState<LanguageMode>(() => {
    if (typeof window === 'undefined') {
      return 'zh-CN'
    }

    const storedLanguage = window.localStorage.getItem('mango-language')
    return storedLanguage === 'en' ? 'en' : 'zh-CN'
  })
  const settingsRef = useRef<HTMLDivElement | null>(null)
  const pageTitle = titleMap[pathname] ?? '仪表盘'

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    try {
      window.localStorage.setItem('mango-theme', theme)
    } catch {
      // Ignore localStorage access failures.
    }
  }, [theme])

  useEffect(() => {
    try {
      window.localStorage.setItem('mango-language', language)
    } catch {
      // Ignore localStorage access failures.
    }
  }, [language])

  useEffect(() => {
    if (!isSettingsOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
        setSettingsPanel('root')
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false)
        setSettingsPanel('root')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isSettingsOpen])

  const languageLabel = useMemo(() => (language === 'zh-CN' ? '中文' : 'English'), [language])
  const themeLabel = useMemo(() => (theme === 'light' ? '亮色' : '暗色'), [theme])
  const displayIdentity = resolveDisplayIdentity(user, authIdentity, isAuthenticated)

  const closeSettings = () => {
    setIsSettingsOpen(false)
    setSettingsPanel('root')
  }

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
            <div className="sidebar__settings" ref={settingsRef}>
              <button
                type="button"
                className={`sidebar__meta-link sidebar__settings-trigger${isSettingsOpen ? ' is-open' : ''}`}
                onClick={() => {
                  setIsSettingsOpen((current) => {
                    const next = !current
                    if (!next) {
                      setSettingsPanel('root')
                    }
                    return next
                  })
                }}
              >
                <span className="sidebar__meta-link-content">
                  <Settings size={14} />
                  <span>设置</span>
                </span>
              </button>

              {isSettingsOpen ? (
                <div className="settings-popover">
                  <div className="settings-popover__panel">
                    <button type="button" className="settings-option" onClick={() => setSettingsPanel('language')}>
                      <span className="settings-option__left">
                        <Globe2 size={18} />
                        <span>语言</span>
                      </span>
                      <span className="settings-option__right">
                        <span>{languageLabel}</span>
                        <ChevronRight size={16} />
                      </span>
                    </button>

                    <button type="button" className="settings-option" onClick={() => setSettingsPanel('theme')}>
                      <span className="settings-option__left">
                        <Palette size={18} />
                        <span>主题</span>
                      </span>
                      <span className="settings-option__right">
                        <span>{themeLabel}</span>
                        <ChevronRight size={16} />
                      </span>
                    </button>
                  </div>

                  {settingsPanel === 'language' ? (
                    <div className="settings-popover__submenu">
                      <button
                        type="button"
                        className={`settings-submenu-option${language === 'zh-CN' ? ' is-active' : ''}`}
                        onClick={() => {
                          setLanguage('zh-CN')
                          closeSettings()
                        }}
                      >
                        中文
                      </button>
                      <button
                        type="button"
                        className={`settings-submenu-option${language === 'en' ? ' is-active' : ''}`}
                        onClick={() => {
                          setLanguage('en')
                          closeSettings()
                        }}
                      >
                        English
                      </button>
                    </div>
                  ) : null}

                  {settingsPanel === 'theme' ? (
                    <div className="settings-popover__submenu">
                      <button
                        type="button"
                        className={`settings-submenu-option${theme === 'light' ? ' is-active' : ''}`}
                        onClick={() => {
                          setTheme('light')
                          closeSettings()
                        }}
                      >
                        <span className="settings-submenu-option__label">
                          <SunMedium size={17} />
                          <span>亮色</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`settings-submenu-option${theme === 'dark' ? ' is-active' : ''}`}
                        onClick={() => {
                          setTheme('dark')
                          closeSettings()
                        }}
                      >
                        <span className="settings-submenu-option__label">
                          <Moon size={17} />
                          <span>暗色</span>
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="sidebar__account">
              <span className="sidebar__account-email" title={displayIdentity.title}>
                {displayIdentity.label}
              </span>
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
                <Link
                  href="/admin"
                  className={`sidebar__link${pathname === '/admin' ? ' is-active' : ''}`}
                  onClick={() => setIsDrawerOpen(false)}
                >
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
