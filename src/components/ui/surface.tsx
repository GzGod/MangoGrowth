'use client'

import type { LucideIcon } from 'lucide-react'

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="section-title">{children}</div>
}

export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`panel ${className}`.trim()}>{children}</section>
}

export function StatCard({
  label,
  value,
  icon: Icon,
  className = '',
}: {
  label: string
  value: string | number
  icon: LucideIcon
  className?: string
}) {
  return (
    <Panel className={`metric-card ${className}`.trim()}>
      <div className="metric-card__header">
        <span>{label}</span>
        <span className="metric-card__icon">
          <Icon size={16} />
        </span>
      </div>
      <strong className="metric-card__value">{value}</strong>
    </Panel>
  )
}

export function EmptyState({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string
  description: string
  action?: React.ReactNode
  eyebrow?: string
}) {
  return (
    <Panel className="empty-state">
      <div className="empty-state__art" aria-hidden="true">
        <div className="empty-state__halo" />
        <div className="empty-state__mango">
          <span className="empty-state__leaf empty-state__leaf--left" />
          <span className="empty-state__leaf empty-state__leaf--right" />
          <span className="empty-state__shine" />
          <span className="empty-state__seed empty-state__seed--one" />
          <span className="empty-state__seed empty-state__seed--two" />
          <span className="empty-state__seed empty-state__seed--three" />
        </div>
      </div>
      <div className="empty-state__copy">
        {eyebrow ? <span className="empty-state__eyebrow">{eyebrow}</span> : null}
        <h3>{title}</h3>
        <p>{description}</p>
        {action}
      </div>
    </Panel>
  )
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`primary-button ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`secondary-button ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}

export function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="status-pill">{children}</span>
}

export function TableShell({
  columns,
  rows,
  emptyText = '暂无数据',
  emptyState,
}: {
  columns: string[]
  rows: Array<Array<React.ReactNode>>
  emptyText?: string
  emptyState?: React.ReactNode
}) {
  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={`${index}-${row[0]}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyState ?? emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
