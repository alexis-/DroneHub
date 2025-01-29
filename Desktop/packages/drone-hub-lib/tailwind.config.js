const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, "./src/**/*.{vue,js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: 'rgb(var(--color-primary-100-rgb) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900-rgb) / <alpha-value>)',
          1000: 'rgb(var(--color-primary-1000-rgb) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover-rgb) / <alpha-value>)',
        },
        surface: {
          100: 'rgb(var(--color-surface-100-rgb) / <alpha-value>)',
          200: 'rgb(var(--color-surface-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--color-surface-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--color-surface-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--color-surface-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--color-surface-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--color-surface-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--color-surface-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--color-surface-900-rgb) / <alpha-value>)',
          1000: 'rgb(var(--color-surface-1000-rgb) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-surface-hover-rgb) / <alpha-value>)',
        },
        accent: {
          100: 'rgb(var(--color-accent-100-rgb) / <alpha-value>)',
          200: 'rgb(var(--color-accent-200-rgb) / <alpha-value>)',
          300: 'rgb(var(--color-accent-300-rgb) / <alpha-value>)',
          400: 'rgb(var(--color-accent-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500-rgb) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600-rgb) / <alpha-value>)',
          700: 'rgb(var(--color-accent-700-rgb) / <alpha-value>)',
          800: 'rgb(var(--color-accent-800-rgb) / <alpha-value>)',
          900: 'rgb(var(--color-accent-900-rgb) / <alpha-value>)',
          1000: 'rgb(var(--color-accent-1000-rgb) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover-rgb) / <alpha-value>)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          light: 'var(--color-border-light)',
          medium: 'var(--color-border-medium)',
          heavy: 'var(--color-border-heavy)',
        },
      },
      spacing: {
        'header': 'var(--spacing-header)',
        'header-tablet': 'var(--spacing-header-tablet)',
        'header-mobile': 'var(--spacing-header-mobile)',
        'statusBar': 'var(--spacing-statusBar)',
        '11': 'var(--spacing-11)',  // 44px
        '13': 'var(--spacing-13)',  // 52px
        '15': 'var(--spacing-15)',  // 60px
        '17': 'var(--spacing-17)',  // 68px
        '19': 'var(--spacing-19)',  // 76px
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
      },
      fontFamily: {
        'sans': ['var(--font-family-primary)'],
      },
      fontSize: {
        'xxs': 'var(--font-size-xxs)',
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
      },
      lineHeight: {
        'tight': 'var(--line-height-tight)',
        'normal': 'var(--line-height-normal)',
        'relaxed': 'var(--line-height-relaxed)',
      },
      transitionDuration: {
        'normal': 'var(--transition-duration-normal)',
        'fast': 'var(--transition-duration-fast)',
      },
      transitionTimingFunction: {
        'DEFAULT': 'var(--transition-timing-function)',
      },
    },
  },
  plugins: [],
}
