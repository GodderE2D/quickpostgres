module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prefer-arrow"],
  rules: {
    "no-var": "error",
    "sort-imports": "error",
    "prefer-arrow-callback": "error",
    "no-warning-comments": "warn",
    "prefer-arrow/prefer-arrow-functions": "error",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
