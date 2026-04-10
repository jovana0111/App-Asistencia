/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        background: '#210706',
        foreground: '#f1e6d2',
        primary: '#f1e6d2',
        secondary: '#b8a08b',
        'muted-foreground': '#b8a08b',
        card: 'rgba(248, 242, 232, 0.06)',
        border: 'rgba(248, 242, 232, 0.1)',
        'accent': 'rgba(241, 230, 210, 0.1)',
        destructive: '#ef4444',
        headerBg: 'rgba(33, 7, 6, 0.9)',
        headerFg: '#f1e6d2'
      }
    },
  },
  plugins: [],
}

