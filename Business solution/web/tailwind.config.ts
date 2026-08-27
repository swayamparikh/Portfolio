import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF8',
        surface: '#FFFFFF',
        ink: '#1E3A5F',
        inksoft: '#4A5C74',
        muted: '#7A8699',
        line: '#ECEBE6',
        line2: '#E2E1DB',
        green: { DEFAULT: '#12A150', soft: '#E6F5EC', ink: '#0C7A3C' },
        amber: { DEFAULT: '#E8A33D', soft: '#FDF3E2' },
        red: { DEFAULT: '#D64545', soft: '#FBEAEA' },
        navysoft: '#EAF0F7'
      },
      borderRadius: { xl: '14px', lg: '11px' },
      fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgba(30,58,95,.05), 0 6px 20px rgba(30,58,95,.06)',
        lg2: '0 10px 40px rgba(30,58,95,.14)'
      }
    }
  },
  plugins: []
};
export default config;
