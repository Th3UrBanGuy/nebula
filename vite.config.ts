
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enabled for debugging in preview
    rollupOptions: {
        output: {
            manualChunks: {
                vendor: ['react', 'react-dom', 'zustand', 'date-fns', 'lucide-react']
            }
        }
    }
  },
  server: {
    host: '0.0.0.0', // Critical: Binds to all interfaces for cloud previews
    port: 3000,
    strictPort: true,
    hmr: {
        clientPort: 443 // Forces HMR over HTTPS, preventing WebSocket failures in tunneled environments
    },
    cors: true,
    allowedHosts: true
  }
});
