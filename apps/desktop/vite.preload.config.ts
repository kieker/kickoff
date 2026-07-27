import { builtinModules } from "node:module";
import { defineConfig } from "vite";

const electronExternals = ["electron", ...builtinModules, ...builtinModules.map((mod) => `node:${mod}`)];

export default defineConfig({
  build: {
    outDir: "dist-electron",
    emptyOutDir: false,
    lib: {
      entry: "electron/preload.ts",
      fileName: "preload",
      formats: ["cjs"]
    },
    rollupOptions: {
      external: electronExternals,
      output: {
        entryFileNames: "preload.cjs"
      }
    }
  }
});
