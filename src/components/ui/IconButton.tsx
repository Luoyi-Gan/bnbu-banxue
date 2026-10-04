import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  label: string
  children: ReactNode
  className?: string
}

export function IconButton({ label, children, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} className={['icon-button', className ?? ''].filter(Boolean).join(' ')} aria-label={label} {...rest}>
      {children}
    </button>
  )
}

interface IconButtonLinkProps extends Omit<ComponentProps<typeof Link>, 'className' | 'children'> {
  label: string
  children: ReactNode
  className?: string
}

export function IconButtonLink({ label, children, className, ...rest }: IconButtonLinkProps) {
  return (
    <Link className={['icon-button', className ?? ''].filter(Boolean).join(' ')} aria-label={label} {...rest}>
      {children}
    </Link>
  )
}
