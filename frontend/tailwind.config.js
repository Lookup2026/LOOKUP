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
          'mint': '#2D2D2D',
          'mint-dark': '#1A1A1A',
          'mint-light': '#F5F5F5',
          'cream': '#FAFAFA',
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
        'button': '0 4px 14px rgba(0, 0, 0, 0.15)',
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
