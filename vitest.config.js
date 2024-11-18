// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./vitest.setup.js",
    // Ensure tests run sequentially to avoid database conflicts
    sequence: {
      shuffle: false,
      concurrent: false,
    },
  },
});
