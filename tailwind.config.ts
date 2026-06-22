import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#006B6B',
          light: '#E0F4F4',
          lighter: '#F0F9F9',
          dark: '#004A4A',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#FDF8ED',
          dark: '#8B6914',
        },
        cream: '#FAF6EF',
        navy: '#0C1829',
        muted: '#5A6B7A',
        border: '#DDE8E8',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 107, 107, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 107, 107, 0.16)',
        gold: '0 4px 20px rgba(201, 168, 76, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

export default config
