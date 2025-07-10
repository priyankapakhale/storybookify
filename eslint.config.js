import tsparser from "@typescript-eslint/parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";

const ignores = [
  "dist/",
  "storybook-app/",
  "node_modules/",
  "__fixtures__/",
  "**/*.d.ts",
  "*.config.*",
  "vitest.config.ts",
  "*.stories.tsx",
];

// JS/JSX block
const jsConfig = {
  files: ["**/*.{js,jsx}"],
  ignores,
  languageOptions: {
    parserOptions: {
      sourceType: "module",
      ecmaVersion: 2021,
    },
    globals: {
      console: true,
      process: true,
      require: true,
      __dirname: true,
      __filename: true,
      module: true,
      exports: true,
    },
  },
  plugins: {
    react: react,
  },
  rules: {
    ...react.configs.recommended.rules,
    "no-unused-vars": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

// TS/TSX block (for main app)
const tsConfig = {
  files: ["**/*.{ts,tsx}"],
  ignores: [
    ...ignores,
    "storybook-app/.storybook/*.ts", // <-- ignore .storybook for this block!
  ],
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      project: "./tsconfig.json",
      sourceType: "module",
      ecmaVersion: 2021,
    },
    globals: {
      console: true,
      process: true,
      require: true,
      __dirname: true,
      __filename: true,
      module: true,
      exports: true,
    },
  },
  plugins: {
    "@typescript-eslint": tseslint,
    react: react,
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    ...react.configs.recommended.rules,
    "no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

// TS block for .storybook (use its own tsconfig)
const storybookTsConfig = {
  files: ["storybook-app/.storybook/*.ts"],
  ignores,
  languageOptions: {
    parser: tsparser,
    parserOptions: {
      project: "./storybook-app/.storybook/tsconfig.json",
      sourceType: "module",
      ecmaVersion: 2021,
    },
    globals: {
      console: true,
      process: true,
      require: true,
      __dirname: true,
      __filename: true,
      module: true,
      exports: true,
    },
  },
  plugins: {
    "@typescript-eslint": tseslint,
    react: react,
  },
  rules: {
    ...tseslint.configs.recommended.rules,
    ...react.configs.recommended.rules,
    "no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

export default [
  jsConfig,
  tsConfig,
  storybookTsConfig, // <-- This block fixes your main.ts linting error!
];
