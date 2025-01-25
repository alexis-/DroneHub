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
          DEFAULT: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover-rgb) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-surface-hover-rgb) / <alpha-value>)',
        },
        accent: {
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
