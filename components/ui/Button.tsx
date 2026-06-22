import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-teal text-white hover:bg-teal-dark',
        secondary: 'bg-white border border-teal text-teal hover:bg-teal-light',
        ghost: 'bg-transparent text-navy hover:bg-teal-light',
        gold: 'bg-gold text-white hover:bg-gold-dark',
        destructive: 'bg-[#B91C1C] text-white hover:bg-[#991515]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button
