import type { ReactNode } from 'react'

interface FieldProps {
  label?: ReactNode
  htmlFor?: string
  help?: ReactNode
  error?: ReactNode
  required?: boolean
  wide?: boolean
  children: ReactNode
}

/**
 * Canonical form field: Label → Control → Help / Validation.
 * Reuses the existing `.field` layout; adds `.field-label`, `.field-help`, `.field-error`.
 */
export function Field({ label, htmlFor, help, error, required, wide, children }: FieldProps) {
  return (
    <div className={['field', wide ? 'field-wide' : ''].filter(Boolean).join(' ')}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          <span>{label}</span>
          {required && <em aria-hidden="true"> *</em>}
        </label>
      )}
      {children}
      {error ? <small className="field-error" role="alert">{error}</small> : help ? <small className="field-help">{help}</small> : null}
    </div>
  )
}
