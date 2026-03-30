// eslint.config.js
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").FlatConfig[]} */
export default [
  {
    // Target files
    files: ["*.ts", "*.js", "src/**/*.ts", "src/**/*.js"],

    // Ignore common folders
    ignores: ["node_modules/", "dist/"],

    // TypeScript parser setup
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },

    // Plugins
    plugins: {
      "@typescript-eslint": tsPlugin,
    },

    // Rules
    rules: {
      // Allow using 'any'
      "@typescript-eslint/no-explicit-any": "off",

      // Warnings instead of errors
      "no-console": "off",
      "no-unused-vars": "warn",
    },
  },
];
