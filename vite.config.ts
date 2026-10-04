import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: false,
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0, // Ensure assets aren't inlined as base64 so PixiJS can fetch by URL
  },
});
