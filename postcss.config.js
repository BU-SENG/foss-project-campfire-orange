export default {
  plugins: {
    // Explicitly point Tailwind to the CommonJS config so PostCSS/Tailwind
    // can read the `content` option at runtime and generate utilities.
    tailwindcss: { config: './tailwind.config.cjs' },
    autoprefixer: {},
  },
};
