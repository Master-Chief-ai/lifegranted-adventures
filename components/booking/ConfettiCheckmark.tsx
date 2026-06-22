'use client'

const CONFETTI_COLORS = ['#C9A84C', '#006B6B', '#15803D', '#B91C1C', '#0C1829']

export function ConfettiCheckmark() {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    delay: `${(i % 10) * 0.08}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }))

  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      <style>{`
        @keyframes lga-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes lga-confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-90px) rotate(180deg); opacity: 0; }
        }
      `}</style>
      {dots.map((dot, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            bottom: '50%',
            left: dot.left,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: dot.color,
            animation: `lga-confetti 1s ease-out ${dot.delay} forwards`,
          }}
        />
      ))}
      <span
        className="flex h-20 w-20 items-center justify-center rounded-full bg-teal text-white"
        style={{ animation: 'lga-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </div>
  )
}

export default ConfettiCheckmark
