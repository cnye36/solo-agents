import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/dist/**", "**/.next/**", "**/node_modules/**"]),
  {
    files: ["apps/api/src/**/*.ts", "packages/*/src/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
]);
