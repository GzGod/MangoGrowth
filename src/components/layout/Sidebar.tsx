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
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Shield,
  Sparkles,
  SunMedium,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useWallets, useConnectWallet } from '@privy-io/react-auth'
import { createWalletClient, custom, publicActions } from 'viem'
import { base, baseSepolia } from 'viem/chains'

import { useSession } from '@/components/providers/session-provider'
import { resolveDisplayIdentity } from '@/lib/auth/identity'

const RECHARGE_OPTIONS = [
  { label: '$100', amountUsd: 10000 },
  { label: '$500', amountUsd: 50000 },
  { label: '$1000', amountUsd: 100000 },
]

const navigation = [
  { href: '/dashboard', label: '仪表盘', icon: BarChart3 },
  { href: '/services', label: '服务', icon: Sparkles },
  { href: '/account-growth', label: '账户增长', icon: TrendingUp },
  { href: '/orders', label: '订单', icon: CalendarDays },
  { href: '/billing', label: '账单', icon: CreditCard },
  { href: '/plans', label: '套餐 & 订阅', icon: Layers3 },
] as const

const pageMeta: Record<string, { title: string; icon: typeof BarChart3 }> = {
  '/dashboard': { title: '仪表盘', icon: BarChart3 },
  '/services': { title: '服务', icon: Sparkles },
  '/account-growth': { title: '账户增长', icon: TrendingUp },
  '/orders': { title: '订单', icon: CalendarDays },
  '/billing': { title: '账单', icon: CreditCard },
  '/plans': { title: '套餐 & 订阅', icon: Layers3 },
  '/admin': { title: '管理后台', icon: Shield },
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
  const { logout, user, authIdentity, isAuthenticated, identityToken, refreshSession } = useSession()
  const { wallets } = useWallets()
  const { connectWallet } = useConnectWallet()
  const isAdminPage = pathname.startsWith('/admin')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<(typeof RECHARGE_OPTIONS)[number] | null>(null)
  const [rechargeStatus, setRechargeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [rechargeError, setRechargeError] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null)

  const activeWallet = wallets.find((w) => w.walletClientType !== 'privy') ?? wallets.find((w) => w.walletClientType === 'privy')

  // Auto-prompt wallet connection when recharge modal opens and no wallet connected
  useEffect(() => {
    if (showRechargeModal && !activeWallet) {
      connectWallet()
    }
  }, [showRechargeModal])

  const USDC_ADDRESS_BASE_SEPOLIA = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  const USDC_ADDRESS_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

  useEffect(() => {
    if (!activeWallet) { setUsdcBalance(null); return }
    const network = process.env.NEXT_PUBLIC_X402_NETWORK ?? 'base-sepolia'
    const usdcAddress = network === 'base' ? USDC_ADDRESS_BASE : USDC_ADDRESS_BASE_SEPOLIA
    const rpcUrl = network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org'
    void (async () => {
      try {
        const res = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 1, method: 'eth_call',
            params: [{ to: usdcAddress, data: `0x70a08231000000000000000000000000${activeWallet.address.slice(2)}` }, 'latest'],
          }),
        })
        const json = await res.json() as { result?: string }
        if (json.result && json.result !== '0x') {
          setUsdcBalance((Number(BigInt(json.result)) / 1e6).toFixed(2))
        } else {
          setUsdcBalance('0.00')
        }
      } catch { setUsdcBalance(null) }
    })()
  }, [activeWallet])

  const effectiveAmountUsd = customAmount
    ? Math.round(parseFloat(customAmount) * 100)
    : (selectedOption?.amountUsd ?? 0)

  const handleRecharge = async () => {
    if (!identityToken) {
      setRechargeError('请先退出并重新登录以完成身份验证')
      return
    }
    if (!activeWallet) {
      setRechargeError('请先连接钱包')
      return
    }
    if (effectiveAmountUsd <= 0) return
    setRechargeStatus('loading')
    setRechargeError(null)
    try {
      // 1. Create recharge order
      const createRes = await fetch('/api/recharge-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${identityToken}` },
        body: JSON.stringify({ amountUsd: effectiveAmountUsd }),
      })
      if (!createRes.ok) throw new Error('创建充值订单失败')
      const { rechargeOrder } = (await createRes.json()) as { rechargeOrder: { id: string } }

      // 2. Hit pay endpoint to get 402 + payment requirements
      const probeRes = await fetch(`/api/recharge-orders/${rechargeOrder.id}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${identityToken}` },
      })
      if (probeRes.status !== 402) {
        if (probeRes.ok) { setRechargeStatus('success'); void refreshSession(); return }
        throw new Error('支付端点异常')
      }
      const { x402Version, accepts } = (await probeRes.json()) as { x402Version: number; accepts: unknown[] }

      // 3. Select payment requirements (prefer USDC)
      const { selectPaymentRequirements } = await import('x402/client')
      const paymentReq = selectPaymentRequirements(accepts as Parameters<typeof selectPaymentRequirements>[0])

      // 4. Build viem wallet client from EIP-1193 provider
      const network = process.env.NEXT_PUBLIC_X402_NETWORK ?? 'base-sepolia'
      const chain = network === 'base' ? base : baseSepolia
      const provider = await activeWallet.getEthereumProvider()
      const walletClient = createWalletClient({ account: activeWallet.address as `0x${string}`, chain, transport: custom(provider) }).extend(publicActions)

      // 5. Build and sign payment header (encodes to base64 internally)
      const { createPaymentHeader } = await import('x402/client')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentHeader = await createPaymentHeader(walletClient as any, x402Version, paymentReq)

      // 6. Retry with X-PAYMENT header
      const payRes = await fetch(`/api/recharge-orders/${rechargeOrder.id}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${identityToken}`, 'X-PAYMENT': paymentHeader, 'Access-Control-Expose-Headers': 'X-PAYMENT-RESPONSE' },
      })
      if (!payRes.ok) {
        const body = (await payRes.json()) as { error?: string }
        throw new Error(body.error ?? '支付失败')
      }
      setRechargeStatus('success')
      void refreshSession()
    } catch (err) {
      console.error('[recharge error]', err)
      setRechargeStatus('error')
      setRechargeError(err instanceof Error ? err.message : '支付失败，请重试')
    }
  }

  const closeRechargeModal = () => {
    setShowRechargeModal(false)
    setSelectedOption(null)
    setCustomAmount('')
    setRechargeStatus('idle')
    setRechargeError(null)
  }
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('mango-sidebar-collapsed') === 'true'
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>('root')
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    const storedTheme = window.localStorage.getItem('mango-theme')
    return storedTheme === 'dark' ? 'dark' : 'light'
  })
  const [language, setLanguage] = useState<LanguageMode>(() => {
    if (typeof window === 'undefined') return 'zh-CN'
    const storedLanguage = window.localStorage.getItem('mango-language')
    return storedLanguage === 'en' ? 'en' : 'zh-CN'
  })
  const settingsRef = useRef<HTMLDivElement | null>(null)

  const currentPage = pageMeta[pathname] ?? pageMeta['/dashboard']
  const HeaderIcon = currentPage.icon

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
    try {
      window.localStorage.setItem('mango-sidebar-collapsed', String(isDesktopSidebarCollapsed))
    } catch {
      // Ignore localStorage access failures.
    }
  }, [isDesktopSidebarCollapsed])

  useEffect(() => {
    if (!isSettingsOpen) return

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

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed((current) => !current)
  }

  return (
    <div className={`app-shell${isDesktopSidebarCollapsed ? ' app-shell--sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <Brand />

        <nav className="sidebar__nav" aria-label="主导航">
          <NavItems />
          {(user?.role === 'ADMIN' || isAdminPage) && (
            <Link href="/admin" className={`sidebar__link${pathname === '/admin' ? ' is-active' : ''}`}>
              <Shield size={16} />
              <span>管理后台</span>
            </Link>
          )}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__invite-card">
            <span className="sidebar__invite-icon">
              <Wallet size={14} />
            </span>
            <span>邀请赚积分</span>
          </div>

          <div className="sidebar__balance">
            <span className="sidebar__balance-label">USD 余额</span>
            <div className="sidebar__balance-row">
              <strong>${((user?.usdBalance ?? 0) / 100).toFixed(2)}</strong>
              <button
                type="button"
                className="sidebar__circle-button"
                aria-label="充值积分"
                onClick={() => setShowRechargeModal(true)}
              >
                <Plus size={12} />
              </button>
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
                    if (!next) setSettingsPanel('root')
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
          <div className="page-header__title">
            <HeaderIcon size={15} />
            <span>{currentPage.title}</span>
          </div>
        </div>

        <header className="page-header page-header--console">
          <button
            type="button"
            className="page-header__sidebar-toggle"
            aria-label={isDesktopSidebarCollapsed ? '展开侧栏' : '隐藏侧栏'}
            onClick={toggleDesktopSidebar}
          >
            {isDesktopSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <div className="page-header__title">
            <HeaderIcon size={15} />
            <h1>{currentPage.title}</h1>
          </div>
        </header>

        <div className="app-shell__page">{children}</div>
      </main>

      {showRechargeModal && (
        <div className="modal-overlay" onClick={closeRechargeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box__header">
              <h3>充值余额</h3>
              <button type="button" onClick={closeRechargeModal} aria-label="关闭"><X size={16} /></button>
            </div>
            {rechargeStatus === 'success' ? (
              <div className="modal-box__success">
                <p>充值成功！余额已到账。</p>
                <button type="button" className="modal-box__close-btn" onClick={closeRechargeModal}>关闭</button>
              </div>
            ) : (
              <>
                <p className="modal-box__desc">选择充值金额，使用钱包中的 USDC 完成支付。</p>
                <div className="recharge-options">
                  {RECHARGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.amountUsd}
                      type="button"
                      className={`recharge-option${selectedOption?.amountUsd === opt.amountUsd && !customAmount ? ' is-selected' : ''}`}
                      onClick={() => { setSelectedOption(opt); setCustomAmount('') }}
                    >
                      <strong>{opt.label}</strong>
                      <span>USDC</span>
                    </button>
                  ))}
                </div>
                <div className="recharge-custom">
                  <label className="recharge-custom__label">自定义金额 (USD)</label>
                  <div className="recharge-custom__input-wrap">
                    <span>$</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="输入金额"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedOption(null) }}
                      className="recharge-custom__input"
                    />
                  </div>
                </div>
                {rechargeError && <p className="modal-box__error">{rechargeError}</p>}

                {!activeWallet ? (
                  <div className="recharge-wallet-empty">
                    <div className="recharge-wallet-empty__icon">
                      <Wallet size={28} />
                    </div>
                    <strong>钱包未连接</strong>
                    <span>加密货币支付需要连接钱包</span>
                    <button type="button" className="modal-box__confirm-btn" onClick={() => connectWallet()}>
                      <Wallet size={14} />
                      连接钱包
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="recharge-wallet-info">
                      <Wallet size={14} />
                      <span>{activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}</span>
                      {usdcBalance !== null && <span className="recharge-wallet-info__balance">{usdcBalance} USDC</span>}
                      <button type="button" className="recharge-wallet-info__disconnect" onClick={() => connectWallet()}>切换钱包</button>
                    </div>
                    <div className="modal-box__actions">
                      <button type="button" className="modal-box__cancel-btn" onClick={closeRechargeModal}>取消</button>
                      <button
                        type="button"
                        className="modal-box__confirm-btn"
                        onClick={() => void handleRecharge()}
                        disabled={effectiveAmountUsd <= 0 || rechargeStatus === 'loading'}
                      >
                        {rechargeStatus === 'loading' ? '支付中...' : `确认支付 $${(effectiveAmountUsd / 100).toFixed(2)}`}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isDrawerOpen ? (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer__backdrop" onClick={() => setIsDrawerOpen(false)} />
          <aside className="mobile-drawer__panel">
            <Brand />
            <nav className="mobile-drawer__nav" aria-label="移动导航">
              <NavItems onNavigate={() => setIsDrawerOpen(false)} />
              {(user?.role === 'ADMIN' || isAdminPage) && (
                <Link
                  href="/admin"
                  className={`sidebar__link${pathname === '/admin' ? ' is-active' : ''}`}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <Shield size={16} />
                  <span>管理后台</span>
                </Link>
              )}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
