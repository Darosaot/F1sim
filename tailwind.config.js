/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sand:        '#ede8dc',
        'sand-lt':   '#f5f1e8',
        ink:         '#1a1a1a',
        'ink-md':    '#888880',
        'ink-lt':    '#c8c4bc',
        rust:        '#e05535',
        gold:        '#c9a030',
        success:     '#2d8c42',
        loss:        '#e05535',
        borderc:     '#d0c8bc',
        garage:      '#1c1c1c',
        'garage-lt': '#2a2a2a',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        body:    ['"Barlow"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
