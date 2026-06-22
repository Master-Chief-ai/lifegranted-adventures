import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ className, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white shadow-card',
        hover && 'transition-all hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  )
}

export default Card
