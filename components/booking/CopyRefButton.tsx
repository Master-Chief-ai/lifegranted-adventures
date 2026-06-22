'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyRefButton({ bookingRef }: { bookingRef: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bookingRef)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-teal-light px-5 py-2 font-mono text-lg font-bold text-teal"
    >
      {bookingRef}
      {copied ? <Check size={18} /> : <Copy size={18} />}
    </button>
  )
}

export default CopyRefButton
