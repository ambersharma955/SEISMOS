import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backend = process.env.SEISMOS_BACKEND_URL || 'http://127.0.0.1:8000';

const proxy = {
  '/api': { target: backend, changeOrigin: true },
  '/health': { target: backend, changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', proxy },
  // `npm run preview` gets the same proxy so a production build can be tested locally.
  preview: { host: '0.0.0.0', proxy },
  build: {
    chunkSizeWarningLimit: 1100, // maplibre-gl is ~1 MB; it is lazy-loaded with Space Observation
    rollupOptions: { output: { manualChunks: { maplibre: ['maplibre-gl'] } } },
  },
});
