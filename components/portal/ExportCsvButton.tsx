'use client'

import { Download } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function ExportCsvButton({ rows, filename }: { rows: Record<string, string | number>[]; filename: string }) {
  function handleExport() {
    if (rows.length === 0) return
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'flex items-center gap-1.5')}>
      <Download size={14} /> Export to CSV
    </button>
  )
}

export default ExportCsvButton
