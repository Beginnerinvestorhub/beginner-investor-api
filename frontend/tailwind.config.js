/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'nyse-primary': 'var(--nyse-color-primary)',
        'nyse-secondary': 'var(--nyse-color-secondary)',
        'nyse-accent': 'var(--nyse-color-accent)',
        'nyse-dark': 'var(--nyse-color-dark)',
        'nyse-text': 'var(--nyse-color-text)',
        'nyse-text-light': 'var(--nyse-color-text-light)',
        'nyse-background': 'var(--nyse-color-background)',
        'nyse-background-alt': 'var(--nyse-color-background-alt)',
        'nyse-border': 'var(--nyse-color-border)',
      },
      fontFamily: {
        'nyse-serif': 'var(--nyse-font-serif)',
        'nyse-sans': 'var(--nyse-font-sans)',
        'nyse-mono': 'var(--nyse-font-mono)',
      },
      spacing: {
        'nyse-xs': 'var(--nyse-spacing-xs)',
        'nyse-sm': 'var(--nyse-spacing-sm)',
        'nyse-md': 'var(--nyse-spacing-md)',
        'nyse-lg': 'var(--nyse-spacing-lg)',
        'nyse-xl': 'var(--nyse-spacing-xl)',
        'nyse-xxl': 'var(--nyse-spacing-xxl)',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
