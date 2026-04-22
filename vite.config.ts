import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/TAPCLAP-Blast/',
  plugins: [react()],
  server: {
    port: 3100,
    host: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
