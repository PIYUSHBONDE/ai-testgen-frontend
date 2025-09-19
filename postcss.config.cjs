// Support either the new @tailwindcss/postcss plugin or the legacy 'tailwindcss'
let tailwindPlugin
try {
  // prefer the new package when installed
  tailwindPlugin = require('@tailwindcss/postcss')
} catch (e) {
  // fallback to the classic package if present
  tailwindPlugin = require('tailwindcss')
}

module.exports = {
  plugins: {
    [tailwindPlugin.postcss ? '@tailwindcss/postcss' : 'tailwindcss']: tailwindPlugin,
    autoprefixer: {},
  },
}
