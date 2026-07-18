import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
  },
  preview: {
    host: '0.0.0.0',
    port: 4_173,
  },
  server: {
    host: '0.0.0.0',
    port: 5_173,
    strictPort: false,
  },
});
