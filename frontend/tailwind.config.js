/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--background) / <alpha-value>)',
        'surface-dim': 'rgb(var(--background) / <alpha-value>)',
        'surface-bright': 'rgb(var(--surface-container-high) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--surface-container-lowest) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--surface-container-low) / <alpha-value>)',
        'surface-container': 'rgb(var(--surface-container) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--surface-container-highest) / <alpha-value>)',
        'on-surface': 'rgb(var(--on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--on-surface-variant) / <alpha-value>)',
        'inverse-surface': 'rgb(var(--inverse-surface) / <alpha-value>)',
        'inverse-on-surface': 'rgb(var(--inverse-on-surface) / <alpha-value>)',
        outline: 'rgb(var(--outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--outline-variant) / <alpha-value>)',
        'surface-tint': 'rgb(var(--primary) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--on-primary) / <alpha-value>)',
        'inverse-primary': 'rgb(var(--inverse-primary) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        'secondary-fixed-dim': 'rgb(var(--secondary-fixed-dim) / <alpha-value>)',
        error: 'rgb(var(--error) / <alpha-value>)',
        'error-container': 'rgb(var(--error-container) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        'on-background': 'rgb(var(--on-background) / <alpha-value>)',
        'surface-variant': 'rgb(var(--surface-container-highest) / <alpha-value>)'
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
