import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        paper: 'var(--paper)',
        panel: 'var(--panel)',
        accent: 'var(--accent)',
        accentSoft: 'var(--accent-soft)',
        line: 'var(--line)',
      },
      boxShadow: {
        frame: '0 24px 80px rgba(39, 25, 12, 0.16)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
