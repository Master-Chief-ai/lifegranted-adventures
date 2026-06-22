import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'teal' | 'gold' | 'green' | 'red' | 'gray' | 'dark'

const variantClasses: Record<BadgeVariant, string> = {
  teal: 'bg-teal-light text-teal',
  gold: 'bg-gold-light text-gold-dark',
  green: 'bg-green-100 text-[#15803D]',
  red: 'bg-red-100 text-[#B91C1C]',
  gray: 'bg-gray-100 text-gray-700',
  dark: 'bg-navy text-white',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'gray', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export default Badge
