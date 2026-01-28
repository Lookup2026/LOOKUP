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
          'mint': '#4A5568',
          'mint-dark': '#2D3748',
          'mint-light': '#F0F2F5',
          'cream': '#F7F8FA',
          'white': '#FFFFFF',
          'black': '#1A202C',
          'gray': '#718096',
          'gray-light': '#E2E8F0',
          'accent': '#5B6BBF',
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
