/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lookup': {
          'mint': '#9DC08B',
          'mint-dark': '#609966',
          'mint-light': '#EDF1D6',
          'cream': '#F5F5F5',
          'white': '#FFFFFF',
          'black': '#1A1A1A',
          'gray': '#6B7280',
          'gray-light': '#E5E7EB',
        }
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'button': '0 4px 14px rgba(157, 192, 139, 0.4)',
      }
    },
  },
  plugins: [],
}
