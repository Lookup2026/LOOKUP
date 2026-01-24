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
          'mint': '#E8A0A0',
          'mint-dark': '#D4817F',
          'mint-light': '#FDF2F2',
          'cream': '#FBF8F8',
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
        'button': '0 4px 14px rgba(232, 160, 160, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.06)',
        'glass-lg': '0 12px 40px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-lg': '24px',
      }
    },
  },
  plugins: [],
}
