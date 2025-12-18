import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('mapbox-gl')) return 'mapbox';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('/react/') || id.includes('react-dom')) return 'react-vendor';
          if (id.includes('axios')) return 'http';
          return 'vendor';
        },
      },
    },
  },
});

