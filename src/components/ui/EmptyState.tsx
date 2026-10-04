import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  compact?: boolean
}

/** Reuses the existing `.empty-state` visual language: Icon → Title → Explanation → Optional CTA. */
export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={['empty-state', compact ? 'compact' : ''].filter(Boolean).join(' ')}>
      {icon}
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
