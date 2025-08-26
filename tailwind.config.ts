import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      colors: {
        luxury: {
          50: '#f7f6f2',
          100: '#efeee7',
          900: '#0a0a0a'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      }
    },
  },
  plugins: [],
}
export default config
