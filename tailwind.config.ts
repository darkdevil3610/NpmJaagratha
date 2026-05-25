import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(124, 255, 107, 0.18), 0 0 48px rgba(124, 255, 107, 0.12)',
      },
      backgroundImage: {
        'grid-radial':
          'radial-gradient(circle at 1px 1px, rgba(124, 255, 107, 0.14) 1px, transparent 0)',
        'hero-glow':
          'radial-gradient(circle at top, rgba(124, 255, 107, 0.16), transparent 45%), radial-gradient(circle at bottom right, rgba(0, 209, 255, 0.08), transparent 40%)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-18%)', opacity: '0' },
          '15%': { opacity: '1' },
          '50%': { transform: 'translateY(52%)', opacity: '1' },
          '100%': { transform: 'translateY(120%)', opacity: '0' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.62' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        scan: 'scan 6s linear infinite',
        drift: 'drift 8s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;