
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
        // Enhanced chunking strategy for better caching
        manualChunks: {
          // Vendor chunk for third-party libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI components chunk
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast', '@radix-ui/react-avatar'],
          // Supabase and query chunk
          supabase: ['@supabase/supabase-js', '@tanstack/react-query'],
          // Charts and heavy components
          charts: ['recharts'],
        },
        // Add hash to filenames for cache busting
        entryFileNames: `assets/[name]-[hash]-${version}.js`,
        chunkFileNames: `assets/[name]-[hash]-${version}.js`,
        assetFileNames: `assets/[name]-[hash]-${version}.[ext]`
      }
    },
    // Optimize bundle size
    minify: 'esbuild',
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  define: {
    // Make version available to the app and service worker
    __APP_VERSION__: JSON.stringify(version),
    __SW_VERSION__: JSON.stringify(`sw-${version}`)
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
}));
