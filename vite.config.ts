
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Generate version based on current timestamp
const version = Date.now().toString();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Add hash to filenames for cache busting
        entryFileNames: `assets/[name]-[hash]-${version}.js`,
        chunkFileNames: `assets/[name]-[hash]-${version}.js`,
        assetFileNames: `assets/[name]-[hash]-${version}.[ext]`
      }
    }
  },
  define: {
    // Make version available to the app and service worker
    __APP_VERSION__: JSON.stringify(version),
    __SW_VERSION__: JSON.stringify(`sw-${version}`)
  }
}));
