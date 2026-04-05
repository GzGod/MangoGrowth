import type { MouseEvent } from 'react'
import { X } from 'lucide-react'

type CreditBundle = {
  label: string
  price: string
  bonus?: string
}

type PointsPurchaseModalProps = {
  open: boolean
  bundles: CreditBundle[]
  selectedBundle: string | null
  onSelect: (label: string) => void
  onClose: () => void
}

function PointsPurchaseModal({
  open,
  bundles,
  selectedBundle,
  onSelect,
  onClose,
}: PointsPurchaseModalProps) {
  if (!open) {
    return null
  }

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="points-modal-title"
        onClick={stopPropagation}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭弹窗">
          <X size={18} />
        </button>
        <h3 id="points-modal-title">积分套餐</h3>
        <p>选择你需要的积分套餐</p>
        <div className="modal-grid">
          {bundles.map((bundle) => (
            <button
              key={bundle.label}
              type="button"
              className={`modal-bundle${selectedBundle === bundle.label ? ' is-selected' : ''}`}
              onClick={() => onSelect(bundle.label)}
            >
              <strong>{bundle.label}</strong>
              {bundle.bonus ? <span>{bundle.bonus}</span> : null}
              <small>{bundle.price}</small>
            </button>
          ))}
        </div>
        <button type="button" className="modal-submit" disabled={!selectedBundle}>
          下一步
        </button>
      </div>
    </div>
  )
}

export default PointsPurchaseModal
