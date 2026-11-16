import { defineConfig } from "vite";

// Dijalankan dari root proyek (lihat script npm), jadi path relatif terhadap root.
export default defineConfig({
  root: "miniapp",
  build: { outDir: "dist", emptyOutDir: true },
});
