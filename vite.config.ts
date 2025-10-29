import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/Satisfying-Drifting/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: true
  }
});
