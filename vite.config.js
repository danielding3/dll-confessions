import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000
  },
  // Handle SPA routing
  build: {
    rollupOptions: {
      input: 'index.html'
    }
  }
});