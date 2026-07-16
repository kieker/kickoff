import { builtinModules } from "node:module";
import { defineConfig } from "vite";

const electronExternals = ["electron", ...builtinModules, ...builtinModules.map((mod) => `node:${mod}`)];

export default defineConfig({
  build: {
    outDir: "dist-electron",
    emptyOutDir: true,
    lib: {
      entry: {
        main: "electron/main.ts",
        preload: "electron/preload.ts"
      },
      formats: ["es"]
    },
    rollupOptions: {
      external: electronExternals,
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
});
