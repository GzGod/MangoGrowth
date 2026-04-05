import { LogOut, Plus, Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { appIdentity, packageBadge, primaryNavigation } from '../../data/navigation'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark" aria-hidden="true">
          <Zap size={16} strokeWidth={2.2} />
        </div>
        <div>
          <div className="sidebar__brand-title">{appIdentity.name}</div>
          <div className="sidebar__brand-tagline">{appIdentity.tagline}</div>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="主导航">
        {primaryNavigation.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button type="button" className="sidebar__invite-card">
          <span className="sidebar__invite-icon">
            <packageBadge.icon size={14} />
          </span>
          <span>{appIdentity.inviteLabel}</span>
        </button>

        <div className="sidebar__balance">
          <span className="sidebar__balance-label">{appIdentity.balanceLabel}</span>
          <div className="sidebar__balance-row">
            <strong>{appIdentity.balanceValue}</strong>
            <button type="button" className="sidebar__circle-button" aria-label="添加积分">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="sidebar__meta">
          <button type="button" className="sidebar__meta-link">
            设置
          </button>
          <div className="sidebar__account">
            <span className="sidebar__account-email">{appIdentity.accountLabel}</span>
            <button type="button" className="sidebar__logout" aria-label="退出登录">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
