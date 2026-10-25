import js from "@eslint/js";
import ts from "typescript-eslint";
export default ts.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "generated/**",
      ".cache/**",
      "public/**",
      "site/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        fetch: "readonly",
        URL: "readonly",
        structuredClone: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        Blob: "readonly",
        FileReader: "readonly",
        HTMLElement: "readonly",
        Storage: "readonly",
        navigator: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
);
