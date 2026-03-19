/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'celo-yellow': '#FCFF52',
        'celo-green': '#35D07F',
        'celo-red': '#FB7C6D',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'Space Mono', 'monospace'],
        sans: ['var(--font-sans)', 'Space Grotesk', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};
