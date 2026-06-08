/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        f1red: '#e10600',
        f1dark: '#0a0a0f',
        f1surface: '#12121a',
        f1border: '#2a2a3a',
        f1text: '#f0f0f0',
        f1muted: '#8888aa',
      },
      fontFamily: {
        racing: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
