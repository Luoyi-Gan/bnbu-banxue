import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'success' | 'ghost' | 'text' | 'destructive'
export type ButtonSize = 'md' | 'sm'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'button-primary',
  secondary: 'button-secondary',
  dark: 'button-dark',
  success: 'button-success',
  ghost: 'button-ghost',
  text: 'button-text',
  destructive: 'button-destructive',
}

function buttonClass(variant: ButtonVariant, size: ButtonSize, full: boolean, extra?: string) {
  return ['button', variantClass[variant], size === 'sm' ? 'button-small' : '', full ? 'button-full' : '', extra ?? '']
    .filter(Boolean)
    .join(' ')
}

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  loading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  children?: ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  startIcon,
  endIcon,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, full, className)} disabled={disabled || loading} {...rest}>
      {loading ? <span className="button-spinner" aria-hidden="true" /> : startIcon}
      {children}
      {!loading && endIcon}
    </button>
  )
}

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, 'className' | 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  children?: ReactNode
  className?: string
}

export function ButtonLink({ variant = 'primary', size = 'md', full = false, startIcon, endIcon, children, className, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, full, className)} {...rest}>
      {startIcon}
      {children}
      {endIcon}
    </Link>
  )
}
