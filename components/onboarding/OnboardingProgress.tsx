import { Check } from 'lucide-react'

export function OnboardingProgress({ step }: { step: number }) {
  const labels = ['Business Info', 'Payout Setup', 'First Tour', 'Review', 'Submitted']
  return (
    <div className="flex items-center justify-center gap-1 py-6 overflow-x-auto">
      {labels.map((label, i) => {
        const index = i + 1
        const completed = index < step
        const active = index === step
        return (
          <div key={label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${completed || active ? 'bg-teal text-white' : 'bg-gray-200 text-muted'}`}>
                {completed ? <Check size={14} /> : index}
              </span>
              <span className={`hidden text-[11px] sm:inline ${active || completed ? 'text-teal' : 'text-muted'}`}>{label}</span>
            </div>
            {index < labels.length && <div className={`h-0.5 w-6 sm:w-12 ${completed ? 'bg-teal' : 'bg-gray-200'}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default OnboardingProgress
