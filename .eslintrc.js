// .eslintrc.js
/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2024: true, node: true },
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "import",
    "simple-import-sort",
    "unused-imports",
    "promise",
    "sonarjs",
    "boundaries",
    "react-refresh",
    "tailwindcss",
  ],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:promise/recommended",
    "plugin:sonarjs/recommended",
    "plugin:tailwindcss/recommended",
  ],
  settings: {
    // Resolver para alias y TS
    "import/resolver": {
      typescript: { project: ["./tsconfig.json"] },
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    },
    // Definición de capas (Clean Architecture)
    "boundaries/elements": [
      { type: "domain", pattern: "src/**/domain/**" },
      { type: "application", pattern: "src/**/application/**" },
      { type: "infrastructure", pattern: "src/**/(infra|infrastructure)/**" },
      { type: "presentation", pattern: "src/**/presentation/**" },
      { type: "shared", pattern: "src/shared/**" },
    ],
  },
  rules: {
    /* ---------- Importaciones y orden ---------- */
    "simple-import-sort/imports": ["error", {
      groups: [
        // React/Next y paquetes externos
        ["^react$", "^next", "^@?\\w"],
        // Alias del proyecto (@/)
        ["^@/"],
        // Imports con side effects (ej. polyfills)
        ["^\\u0000"],
        // Relativos: primero padres, luego hermanos, luego mismos dir
        ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
        ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
        // Estilos al final
        ["^.+\\.css$"],
      ],
    }],
    "simple-import-sort/exports": "error",
    "import/no-duplicates": "error",
    "import/newline-after-import": ["error", { count: 1 }],
    "import/no-extraneous-dependencies": ["warn", {
      devDependencies: [
        "**/*.test.*",
        "**/*.spec.*",
        "**/vitest.setup.*",
        "**/.storybook/**",
        "storybook/**",
      ],
    }],

    /* ---------- Limpieza ---------- */
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

    /* ---------- TypeScript ---------- */
    "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/consistent-type-definitions": ["warn", "type"],

    /* ---------- React / Next DX ---------- */
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

    /* ---------- Promesas ---------- */
    "promise/no-return-wrap": "error",
    "promise/always-return": "warn",
    "promise/no-nesting": "warn",

    /* ---------- Tailwind ---------- */
    "tailwindcss/no-custom-classname": "off", // pon "warn" si quieres forzar convenciones

    /* ---------- Consolas ---------- */
    "no-console": process.env.NODE_ENV === "production" ? ["warn", { allow: ["error"] }] : "off",

    /* ---------- Boundaries (capas) ---------- */
    "boundaries/allowed-types": ["error", {
      default: "disallow",
      rules: [
        { from: "domain", allow: ["domain", "shared"] },
        { from: "application", allow: ["domain", "application", "shared"] },
        { from: "infrastructure", allow: ["application", "domain", "shared"] },
        { from: "presentation", allow: ["application", "domain", "shared"] },
        { from: "shared", allow: ["shared"] },
      ],
    }],
    "boundaries/no-unknown": "error",
  },
  overrides: [
    // Tests
    {
      files: ["**/*.test.*", "**/*.spec.*"],
      env: { jest: true },
      rules: {
        "sonarjs/no-duplicate-string": "off",
      },
    },
    // Configs y scripts
    {
      files: ["**/*.config.*", "scripts/**"],
      rules: { "import/no-extraneous-dependencies": "off" },
    },
  ],
  ignorePatterns: [
    ".next/**",
    "node_modules/**",
    "coverage/**",
    "dist/**",
    "build/**",
    "public/**",
  ],
};
