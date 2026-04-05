import { Menu } from 'lucide-react'

type MobileNavProps = {
  title: string
  onOpenMenu: () => void
}

function MobileNav({ title, onOpenMenu }: MobileNavProps) {
  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav__button"
        aria-label="打开导航菜单"
        onClick={onOpenMenu}
      >
        <Menu size={18} />
      </button>
      <strong>{title}</strong>
    </div>
  )
}

export default MobileNav
