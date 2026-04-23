/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Safelist ensures dynamic class strings from constants are always included
  safelist: [
    // Stage badge classes
    'bg-gray-100','text-gray-600',
    'bg-sky-100','text-sky-700',
    'bg-blue-100','text-blue-700',
    'bg-violet-100','text-violet-700',
    'bg-emerald-100','text-emerald-700',
    'bg-red-100','text-red-600','text-red-700',
    // Priority badge classes
    'bg-orange-100','text-orange-700',
    'bg-gray-200','text-gray-500',
    // Custom pn classes used dynamically
    'bg-pn-sky','text-pn-navy','bg-pn-lime','text-pn-green','text-pn-green-dark',
    'ring-2','ring-offset-1',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        pn: {
          navy:          '#245293',
          'navy-dark':   '#1a3d70',
          green:         '#519831',
          'green-dark':  '#3e7827',
          blue:          '#0872c7',
          orange:        '#f89600',
          'orange-dark': '#db6204',
          sky:           '#d2edfa',
          lime:          '#dcf0a9',
          bg:            '#f4f7fb',
          border:        '#e4edf8',
          'border-mid':  '#dde6f0',
          dark:          '#1a2a3a',
          muted:         '#5a6a7a',
          faint:         '#8a9aaa',
        },
      },
    },
  },
  plugins: [],
}
