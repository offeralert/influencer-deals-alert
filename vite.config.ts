
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Generate version based on current timestamp for cache busting
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
    // Make version available to the app
    __APP_VERSION__: JSON.stringify(version),
    __CACHE_VERSION__: JSON.stringify(`v${version}`)
  }
}));
