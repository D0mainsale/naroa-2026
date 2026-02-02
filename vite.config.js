import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './', // Relative paths for static deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Limpia logs en prod
        drop_debugger: true
      }
    }
  },
  server: {
    host: true,
    open: true
  }
});
