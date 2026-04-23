import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pn: {
          navy:          '#245293',
          'navy-dark':   '#1a3d70',
          'navy-mid':    '#2d5fa8',
          green:         '#519831',
          'green-dark':  '#3e7827',
          blue:          '#0872c7',
          dark:          '#1a2a3a',
          muted:         '#5a6a7a',
          faint:         '#8a9aaa',
          bg:            '#f4f7fb',
          sky:           '#d2edfa',
          lime:          '#dcf0a9',
          border:        '#e4edf8',
          'border-mid':  '#dde6f0',
        },
      },
    },
  },
  plugins: [],
}
export default config
