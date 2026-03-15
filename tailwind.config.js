/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kang: {
          orange: '#FF6B35',
          yellow: '#FFD700',
          green: '#4CAF50',
          blue: '#2196F3',
          purple: '#9C27B0',
          pink: '#E91E63',
          teal: '#009688',
          coral: '#FF7043',
        }
      },
      fontFamily: {
        display: ['Nunito', 'Comic Sans MS', 'cursive'],
        body: ['Nunito', 'Arial', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'star-spin': 'spin 1.5s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
