import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leadingIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leadingIcon, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{leadingIcon}</span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-navy placeholder:text-muted focus:border-teal',
              leadingIcon && 'pl-9',
              error && 'border-[#B91C1C]',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-[#B91C1C]">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-muted">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
export default Input
