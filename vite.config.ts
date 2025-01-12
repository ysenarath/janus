import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']  // Exclude WASM modules from optimization
  },
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'esnext',
    modulePreload: {
      polyfill: false // Disable module preload for WASM compatibility
    },
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks: undefined, // Prevent code splitting for WASM modules
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'es'
      }
    }
  },
  worker: {
    format: 'es',
    plugins: () => [react()],
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: undefined // Prevent code splitting for worker WASM modules
      }
    }
  }
});
