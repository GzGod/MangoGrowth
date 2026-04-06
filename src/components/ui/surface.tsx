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
}: {
  label: string
  value: string | number
  icon: LucideIcon
}) {
  return (
    <Panel className="metric-card">
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
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <Panel className="empty-state">
      <div className="empty-state__copy">
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
}: {
  columns: string[]
  rows: Array<Array<React.ReactNode>>
  emptyText?: string
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
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
