import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";          // node:path werkt in Node 18/20+

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
    },
  },
});

