/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  // The site has its own styles and uses no Tailwind utility classes: keep only the base reset
  // (preflight), so no unused utilities or --tw-* variables are shipped.
  corePlugins: ['preflight'],
  plugins: [],
};
