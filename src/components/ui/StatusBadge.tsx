import type { ReactNode } from 'react'

export type StatusTone =
  | 'going'
  | 'pending'
  | 'waitlist'
  | 'checked_in'
  | 'cancelled'
  | 'rejected'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'

interface StatusBadgeProps {
  tone?: StatusTone
  children: ReactNode
}

/** Generic semantic status pill. Reuses the existing `.status-pill` + `status-*` classes. */
export function StatusBadge({ tone = 'neutral', children }: StatusBadgeProps) {
  return <span className={`status-pill status-${tone}`}>{children}</span>
}
