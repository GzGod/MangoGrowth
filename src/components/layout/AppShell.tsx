import { X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { appIdentity, primaryNavigation } from '../../data/navigation'
import MobileNav from './MobileNav'
import PageHeader from './PageHeader'
import Sidebar from './Sidebar'

const titleMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/services': '服务',
  '/account-growth': '账户增长',
  '/orders': '订单',
  '/billing': '账单',
  '/plans': '套餐 & 订阅',
}

function AppShell() {
  const location = useLocation()
  const title = titleMap[location.pathname] ?? '仪表盘'
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell__content">
        <MobileNav title={title} onOpenMenu={() => setIsMobileDrawerOpen(true)} />
        <PageHeader title={title} />
        <div className="app-shell__page">
          <Outlet />
        </div>
      </main>

      {isMobileDrawerOpen ? (
        <div
          className="mobile-drawer"
          data-testid="mobile-drawer"
          role="dialog"
          aria-modal="true"
        >
          <div className="mobile-drawer__backdrop" onClick={() => setIsMobileDrawerOpen(false)} />
          <aside className="mobile-drawer__panel">
            <div className="mobile-drawer__header">
              <div>
                <div className="sidebar__brand-title">{appIdentity.name}</div>
                <div className="sidebar__brand-tagline">{appIdentity.tagline}</div>
              </div>
              <button
                type="button"
                className="mobile-nav__button"
                aria-label="关闭导航菜单"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mobile-drawer__nav" aria-label="移动导航">
              {primaryNavigation.map(({ icon: Icon, label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
                  onClick={() => setIsMobileDrawerOpen(false)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

export default AppShell
