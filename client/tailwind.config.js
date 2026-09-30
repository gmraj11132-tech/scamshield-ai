/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#050506',
        panel: '#0d0d10',
        'panel-subtle': '#131317',
        'panel-elevated': '#18181d',
        border: '#222227',
        'border-hover': '#32323a',
        'border-focus': '#454550',
        brand: {
          white: '#ffffff',
          dark: '#000000',
          zinc: '#18181b',
        },
        risk: {
          critical: '#ef4444',
          high: '#f97316',
          elevated: '#eab308',
          medium: '#3b82f6',
          low: '#10b981',
          negligible: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'panel': '0 8px 30px rgba(0, 0, 0, 0.6)',
        'elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}
