import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,

    rollupOptions: {
      input: {
        main: 'index.html',
        product: 'product.html',
        about: 'about.html',
        contact: 'contact.html'
      }
    }
  }
});