import globals from "globals";
import pluginJs from "@eslint/js";
import { FlatCompat } from '@eslint/eslintrc'
import tseslint from "@typescript-eslint/eslint-plugin"; // Исправлено
import pluginReact from "eslint-plugin-react";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
})
export default [
  { 
    ...compat.config({
      extends: ['eslint:recommended', 'next'],
    }),
    files: ["**/*.{js,jsx,ts,tsx}"], 
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react": pluginReact
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off" // Для Next.js
    }
  }
];
