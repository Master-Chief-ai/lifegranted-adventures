'use client'

import { Share2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function ShareWhatsAppButton({ tourTitle, date }: { tourTitle: string; date: string }) {
  const text = `I just booked a Tanzania safari with LifeGranted Adventures! 🦁 ${tourTitle} on ${date}`
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'flex items-center gap-1.5')}>
      <Share2 size={14} /> Share on WhatsApp
    </a>
  )
}

export default ShareWhatsAppButton
