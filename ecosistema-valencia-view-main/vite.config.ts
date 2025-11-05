import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    middlewareMode: false,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
    allowedHosts: [
      "web-app-camara-valen.rzd02y.easypanel.host",
      "web-app-camara-vlc.rzd02y.easypanel.host",
      "localhost",
      "127.0.0.1",
      ".easypanel.host",
    ],
    cors: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
