import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // tsconfigPaths resuelve los alias `@/*` y los barrels por feature.
  // El JSX/TSX lo transforma esbuild (runtime automático de React), sin necesidad
  // de @vitejs/plugin-react (que generaba conflicto de peer-deps con shadcn/babel).
  plugins: [tsconfigPaths()],
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Mantiene estables las ejecuciones filtradas aunque no encuentren coincidencias.
    passWithNoTests: true,
    css: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: [
        "src/shared/errors/**",
        "src/features/leads/domain/**",
        "src/features/contact/domain/**",
        "src/features/leads/infra/http/mappers.ts",
      ],
    },
  },
});
