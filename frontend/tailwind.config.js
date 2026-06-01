/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--background)',
        'surface-dim': 'var(--background)',
        'surface-bright': 'var(--surface-container-high)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        'surface-tint': 'var(--primary)',
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        'inverse-primary': 'var(--inverse-primary)',
        secondary: 'var(--secondary)',
        'secondary-fixed-dim': 'var(--secondary-fixed-dim)',
        error: 'var(--error)',
        'error-container': 'var(--error-container)',
        background: 'var(--background)',
        'on-background': 'var(--on-background)',
        'surface-variant': 'var(--surface-container-highest)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      }
    },
  },
  plugins: [],
}
