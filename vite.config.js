import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: {
          'vendor': ['@supabase/supabase-js'],
          'animations': ['animejs']
        }
      }
    },
    minify: 'terser',
    sourcemap: false,
    // Add cache busting
    chunkFileNames: 'assets/[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]'
  }
});