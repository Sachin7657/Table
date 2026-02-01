// .storybook/tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    '../src/**/*.{ts,tsx}',
    '../stories/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
