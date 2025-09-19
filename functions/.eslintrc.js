/* eslint-env node */
/* eslint-disable no-undef, no-unused-vars */
// functions/.eslintrc.js
module.exports = {
  root: true,
  env: {
    node: true,       // <-- important: allow require/module/exports etc.
    es2021: true
  },
  extends: [
    "eslint:recommended"
    // add other extends you need (e.g. "google") if you want
  ],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    // Add or relax rules if needed, e.g.:
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
};
